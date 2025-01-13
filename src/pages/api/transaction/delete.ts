import { NextApiRequest, NextApiResponse } from "next";
import client from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/utils/sessionConfig";
import { SessionData } from "@/utils/sessionData";

// This endpoint is used to delete a transaction
// It is used to delete a transaction from the user's transaction list, using the transaction ID to delete the transaction

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "DELETE") {
    try {
      // Get session
      const session = await getIronSession<SessionData>(
        req,
        res,
        sessionOptions
      );

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

      // Get the transaction ID from the request body
      const { _id } = req.body;

      if (!ObjectId.isValid(_id)) {
        return res.status(400).json({ message: "Invalid transaction ID" });
      }

      // Find the transaction in the database
      const transaction = await client
        .db()
        .collection("transactions")
        .findOne({ _id: new ObjectId(_id), userId: user._id });

      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }

      // Start a session for the transaction to ensure atomicity
      const sessionDb = client.startSession();
      sessionDb.startTransaction();

      try {
        // Delete the transaction from the transactions collection
        const result = await client
          .db()
          .collection("transactions")
          .deleteOne({ _id: new ObjectId(_id), userId: user._id });

        if (result.deletedCount === 0) {
          await sessionDb.abortTransaction();
          return res.status(404).json({ message: "Transaction not found" });
        }

        // Remove the transaction ID from the user's transactions array
        await client
          .db()
          .collection("users")
          .updateOne({ _id: user._id }, {
            $pull: { transactions: new ObjectId(_id) },
          } as any);

        // Recalculate the user's balance by fetching remaining transactions
        const remainingTransactions = await client
          .db()
          .collection("transactions")
          .find({ userId: user._id })
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

        // Commit the transaction
        await sessionDb.commitTransaction();
        sessionDb.endSession();

        return res
          .status(200)
          .json({ message: "Transaction deleted successfully" });
      } catch (error) {
        await sessionDb.abortTransaction();
        sessionDb.endSession();
        console.error(error); // Log the error
        return res.status(500).json({ message: "Internal Server Error" });
      }
    } catch (error) {
      console.error(error); // Log any unexpected errors
      return res.status(500).json({ message: "Internal Server Error" });
    }
  } else {
    // Method not allowed for other HTTP methods
    res.setHeader("Allow", ["DELETE"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
