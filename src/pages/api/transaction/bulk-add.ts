import TransactionSchema from "@/schemas/transactionSchema";
import { NextApiRequest, NextApiResponse } from "next";
import client from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/utils/sessionConfig";
import { SessionData } from "@/utils/sessionData";
import { captureEvent } from "@/utils/posthogHelper";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const session = await getIronSession<SessionData>(req, res, sessionOptions);

    // Make sure they're logged in
    if (!session.user?._id) {
      captureEvent("Batch Import Unauthorized", {
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
      captureEvent("Batch Import User Not Found", {
        properties: { userId: session.user._id },
      });
      return res.status(401).json({ message: "Unauthorized" });
    }

    const body = req.body;

    // Expect an array of transactions
    if (!Array.isArray(body)) {
      captureEvent("Batch Import Invalid Format", {
        properties: { received: typeof body },
      });
      return res.status(400).json({ message: "Invalid data format" });
    }

    const formattedTransactions = [];

    for (const [index, transaction] of body.entries()) {
      try {
        const parsed = TransactionSchema.parse(transaction);
        const value = parseFloat(parsed.value.toString());

        if (isNaN(value)) throw new Error("Invalid transaction value");

        formattedTransactions.push({
          _id: new ObjectId(),
          value,
          tags: parsed.tags,
          name: parsed.name,
          description: parsed.description,
          userId,
          date: parsed.date ? new Date(parsed.date) : new Date(),
        });
      } catch (err: any) {
        captureEvent("Batch Import Validation Error", {
          properties: {
            userId: session.user._id,
            index,
            error: err.message,
            transaction,
          },
        });
        return res.status(400).json({
          message: `Invalid transaction data at index ${index}`,
          error: err.message,
        });
      }
    }

    // Dump the transactions into the collection
    const insertResult = await transactions.insertMany(formattedTransactions);

    // Save references on the user doc
    const transactionIds = formattedTransactions.map((tx) => tx._id);
    await users.updateOne(
      { _id: userId },
      { $addToSet: { transactions: { $each: transactionIds } } }
    );

    // Update balance
    const newBalance = formattedTransactions.reduce(
      (acc, tx) => acc + tx.value,
      user.balance || 0
    );

    await users.updateOne({ _id: userId }, { $set: { balance: newBalance } });

    captureEvent("Batch Import Success", {
      properties: {
        userId: session.user._id,
        count: insertResult.insertedCount,
      },
    });

    return res.status(201).json({
      message: "Transactions added successfully",
      insertedCount: insertResult.insertedCount,
    });
  } catch (err: any) {
    captureEvent("Batch Import Error", {
      properties: {
        error: err,
      },
    });

    console.error("Unexpected error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}
