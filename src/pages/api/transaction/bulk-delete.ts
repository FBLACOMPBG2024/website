import { NextApiRequest, NextApiResponse } from "next";
import client from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/utils/sessionConfig";
import { SessionData } from "@/utils/sessionData";
import { captureEvent } from "@/utils/posthogHelper";

// Allows users to delete one, many, or all of their transactions

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "DELETE") {
    res.setHeader("Allow", ["DELETE"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const session = await getIronSession<SessionData>(req, res, sessionOptions);

    if (!session.user?._id) {
      captureEvent("Delete Transactions Unauthorized", {
        properties: { reason: "No session" },
      });
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = new ObjectId(session.user._id);
    const db = client.db();
    const users = db.collection("users");
    const transactions = db.collection("transactions");

    const user = await users.findOne({ _id: userId });
    if (!user) {
      captureEvent("Delete Transactions User Not Found", {
        properties: { userId: session.user._id },
      });
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { transactionIds } = req.body;

    // If no IDs are provided, nuke all transactions
    if (!transactionIds) {
      await transactions.deleteMany({ userId });
      await users.updateOne(
        { _id: userId },
        { $set: { transactions: [], balance: 0 } }
      );

      captureEvent("Deleted All Transactions", {
        properties: { userId: session.user._id },
      });

      return res.status(200).json({ message: "All transactions deleted" });
    }

    // Validate input
    if (!Array.isArray(transactionIds) || transactionIds.length === 0) {
      return res.status(400).json({ message: "Invalid data format" });
    }

    const objectIds = transactionIds.map((id: string) => new ObjectId(id));

    // Delete specified transactions
    const result = await transactions.deleteMany({ _id: { $in: objectIds } });

    if (result.deletedCount === 0) {
      captureEvent("Delete Transactions Not Found", {
        properties: { userId: session.user._id, transactionIds },
      });
      return res
        .status(404)
        .json({ message: "No transactions found to delete" });
    }

    // Remove references from user doc
    await users.updateOne({ _id: userId }, {
      $pull: { transactions: { $in: objectIds } },
    } as any);

    // Recalculate balance
    const remaining = await transactions.find({ userId }).toArray();
    const newBalance = remaining.reduce((acc, tx) => acc + tx.value, 0);

    await users.updateOne({ _id: userId }, { $set: { balance: newBalance } });

    captureEvent("Deleted Specific Transactions", {
      properties: {
        userId: session.user._id,
        deletedCount: result.deletedCount,
      },
    });

    return res.status(200).json({
      message: "Transactions deleted successfully",
      deletedCount: result.deletedCount,
    });
  } catch (error: any) {
    captureEvent("Delete Transactions Error", {
      properties: {
        error,
      },
    });

    console.error("Failed to delete transactions:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
