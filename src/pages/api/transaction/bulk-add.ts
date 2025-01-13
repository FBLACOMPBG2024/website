import TransactionSchema from "@/schemas/transactionSchema";
import { NextApiRequest, NextApiResponse } from "next";
import client from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/utils/sessionConfig";
import { SessionData } from "@/utils/sessionData";

// This endpoint is used to add multiple transactions
// It is used to add multiple transactions to the user's transaction list

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
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

    const transactions = req.body;

    if (!Array.isArray(transactions)) {
      return res.status(400).json({ message: "Invalid data format" });
    }

    const formattedTransactions = [];

    // Loop through transactions and validate them
    for (const [index, transaction] of transactions.entries()) {
      try {
        const parsedTransaction = TransactionSchema.parse(transaction);
        const value = parseFloat(parsedTransaction.value.toString());
        if (isNaN(value)) {
          throw new Error(`Invalid transaction value at index ${index}`);
        }

        formattedTransactions.push({
          _id: new ObjectId(),
          value,
          tags: parsedTransaction.tags,
          name: parsedTransaction.name,
          description: parsedTransaction.description,
          userId: user._id,
          date: parsedTransaction.date
            ? new Date(parsedTransaction.date)
            : new Date(),
        });
      } catch (error: any) {
        // Include index in the error message for better debugging
        console.error(`Error in transaction at index ${index}:`, error.message);
        return res.status(400).json({
          message: `Invalid transaction data at index ${index}`,
          error: error.message,
        });
      }
    }

    // Use a transaction to ensure atomicity
    const sessionDb = client.startSession();
    sessionDb.startTransaction();

    try {
      // Insert the transactions into the database
      const result = await client
        .db()
        .collection("transactions")
        .insertMany(formattedTransactions, { session: sessionDb });

      // Update user transaction list
      const transactionIds = formattedTransactions.map(
        (transaction) => transaction._id
      );
      await client
        .db()
        .collection("users")
        .updateOne(
          { _id: user._id },
          { $addToSet: { transactions: { $each: transactionIds } } },
          { session: sessionDb }
        );

      // Calculate new balance
      const newBalance = formattedTransactions.reduce(
        (acc, transaction) => acc + transaction.value,
        user.balance
      );

      // Update the user's balance
      await client
        .db()
        .collection("users")
        .updateOne(
          { _id: user._id },
          { $set: { balance: newBalance } },
          { session: sessionDb }
        );

      // Commit the transaction
      await sessionDb.commitTransaction();
      sessionDb.endSession();

      return res.status(201).json({
        message: "Transactions added successfully",
        insertedCount: result.insertedCount,
      });
    } catch (error) {
      // If an error occurs, abort the transaction
      await sessionDb.abortTransaction();
      sessionDb.endSession();
      console.error("Failed to add transactions:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  } catch (error) {
    console.error("Unexpected error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
