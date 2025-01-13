import { NextApiRequest, NextApiResponse } from "next";
import TransactionSchema from "@/schemas/transactionSchema";
import { sendEmailVerification } from "@/utils/email";
import client from "@/lib/mongodb";
import argon2 from "argon2";
import { ObjectId } from "mongodb";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/utils/sessionConfig";
import { SessionData } from "@/utils/sessionData";

// This endpoint is used to create a new transaction
// It is used to create a new transaction and add it to the user's transaction list

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    // Get session
    const session = await getIronSession<SessionData>(req, res, sessionOptions);

    if (!session.user?._id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const userId = new ObjectId(session.user._id);

      // Get the user from the database
      const user = await client
        .db()
        .collection("users")
        .findOne({ _id: userId });

      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Validate and parse the request body using the zod schema
      const parsedBody = TransactionSchema.parse(req.body);
      const { value, tags, name, description, date } = parsedBody;

      // Ensure the date is valid and not in the future
      if (date && new Date(date) > new Date()) {
        return res.status(400).json({ message: "Invalid date" });
      }

      // Create the transaction object
      const transaction = {
        _id: new ObjectId(),
        value,
        tags,
        name,
        description,
        userId: user._id,
        date: date ? new Date(date) : new Date(),
      };

      // Start a database session for atomicity
      const sessionDb = client.startSession();
      sessionDb.startTransaction();

      try {
        // Insert the transaction into the database
        await client
          .db()
          .collection("transactions")
          .insertOne(transaction, { session: sessionDb });

        // Update user transaction list
        await client
          .db()
          .collection("users")
          .updateOne(
            { _id: user._id },
            { $addToSet: { transactions: transaction._id } },
            { session: sessionDb }
          );

        // Recalculate balance
        const transactions = await client
          .db()
          .collection("transactions")
          .find({ userId: user._id })
          .toArray();

        const balance = transactions.reduce(
          (acc, transaction) => acc + transaction.value,
          0
        );

        // Update user balance
        await client
          .db()
          .collection("users")
          .updateOne(
            { _id: user._id },
            { $set: { balance: balance } },
            { session: sessionDb }
          );

        // Commit the transaction
        await sessionDb.commitTransaction();
        sessionDb.endSession();

        // Respond with the created transaction
        return res.status(201).json(transaction);
      } catch (err) {
        // If an error occurs, abort the transaction
        await sessionDb.abortTransaction();
        sessionDb.endSession();
        console.error("Transaction creation failed:", err);
        throw err;
      }
    } catch (error: any) {
      // Handle validation or other errors
      if (error.name === "ZodError") {
        return res.status(400).json({
          message: "Invalid data",
          errors: error.errors, // Send the validation errors
        });
      }

      console.error("Unexpected error:", error); // Log unexpected errors
      return res.status(500).json({ message: "Internal Server Error" });
    }
  } else {
    // Method not allowed for other HTTP methods
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
