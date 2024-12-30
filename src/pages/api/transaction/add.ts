import TransactionSchema from "@/schemas/transactionSchema";
import { NextApiRequest, NextApiResponse } from "next";
import client from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import cookie from "cookie";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    // Get user from request cookie
    const cookies = cookie.parse(req.headers.cookie || "");
    const token = cookies.token || "";

    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      // Get the user from the database
      const user = await client
        .db()
        .collection("users")
        .findOne({ _id: new ObjectId(token) });

      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Validate and parse the request body using the zod schema
      const parsedBody = TransactionSchema.parse(req.body);

      const { value, tags, name, description, date } = parsedBody;

      // Create the transaction object
      const transaction = {
        _id: new ObjectId(),
        value,
        tags,
        name,
        description,
        userId: user._id,
        date: date || new Date(),
      };

      // Insert the transaction into the database
      await client.db().collection("transactions").insertOne(transaction);

      // Update user transaction list
      await client
        .db()
        .collection("users")
        .updateOne(
          { _id: user._id },
          { $addToSet: { transactions: transaction._id } }
        );

      const transactions = await client
        .db()
        .collection("transactions")
        .find({ userId: user._id })
        .toArray();

      // Calculate the balance
      const balance = transactions.reduce(
        (acc, transaction) => acc + transaction.value,
        0
      );

      // Update user balance
      await client
        .db()
        .collection("users")
        .updateOne({ _id: user._id }, { $set: { balance: balance } });

      // Respond with the created transaction
      return res.status(201).json(transaction);
    } catch (error: any) {
      // Handle validation or other errors
      if (error.name === "ZodError") {
        return res.status(400).json({
          message: "Invalid data",
          errors: error.errors, // Send the validation errors
        });
      }

      console.error(error); // Log any unexpected errors
      return res.status(500).json({ message: "Internal Server Error" });
    }
  } else {
    // Method not allowed for other HTTP methods
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
