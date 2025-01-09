import { NextApiRequest, NextApiResponse } from "next";
import client from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/utils/sessionConfig";
import { SessionData } from "@/utils/sessionData";

// This endpoint is used to delete multiple transactions
// It removes the transactions from the database and updates the user's transaction list

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "DELETE") {
    res.setHeader("Allow", ["DELETE"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    // Get session
    const session = await getIronSession<SessionData>(req, res, sessionOptions);

    if (!session.user?._id) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    // Get the user from the database
    const user = await client
      .db()
      .collection("users")
      .findOne({ _id: new ObjectId(session.user._id) });

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { transactionIds } = req.body;

    if (!transactionIds) {
      // Delete all transactions
      await client
        .db()
        .collection("transactions")
        .deleteMany({ userId: user._id });

      // Delete all transactions from the user's transaction list
      await client
        .db()
        .collection("users")
        .updateOne({ _id: user._id }, { $set: { transactions: [] } });

      // Update the user's balance
      await client
        .db()
        .collection("users")
        .updateOne({ _id: user._id }, { $set: { balance: 0 } });

      return res.status(200).json({ message: "All transactions deleted" });
    }

    if (!Array.isArray(transactionIds) || transactionIds.length === 0) {
      return res.status(400).json({ message: "Invalid data format" });
    }

    // Convert string IDs to ObjectId
    const objectIds = transactionIds.map((id: string) => new ObjectId(id));

    // Remove the transactions from the "transactions" collection
    const result = await client
      .db()
      .collection("transactions")
      .deleteMany({ _id: { $in: objectIds } });

    if (result.deletedCount === 0) {
      return res
        .status(404)
        .json({ message: "No transactions found to delete" });
    }

    // Remove the transaction IDs from the user's transactions list
    await client
      .db()
      .collection("users")
      .updateOne(
        { _id: user._id },
        { $addToSet: { transactions: { $in: objectIds } } }
      );

    // Recalculate the user's balance after deletion
    const remainingTransactions = await client
      .db()
      .collection("transactions")
      .find({ _id: { $in: user.transactions } })
      .toArray();

    const newBalance = remainingTransactions.reduce(
      (acc, transaction) => acc + transaction.value,
      0
    );

    // Update the user's balance
    await client
      .db()
      .collection("users")
      .updateOne({ _id: user._id }, { $set: { balance: newBalance } });

    return res.status(200).json({
      message: "Transactions deleted successfully",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Failed to delete transactions:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
