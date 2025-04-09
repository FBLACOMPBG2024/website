import { NextApiRequest, NextApiResponse } from "next";
import TransactionSchema from "@/schemas/transactionSchema";
import client from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/utils/sessionConfig";
import { SessionData } from "@/utils/sessionData";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const session = await getIronSession<SessionData>(req, res, sessionOptions);

  if (!session.user?._id) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const userId = new ObjectId(session.user._id);
    const db = client.db();
    const users = db.collection("users");
    const transactions = db.collection("transactions");

    const user = await users.findOne({ _id: userId });
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const parsedBody = TransactionSchema.parse(req.body);
    const { value, tags, name, description, date } = parsedBody;

    if (date && new Date(date) > new Date()) {
      return res.status(400).json({ message: "Invalid date" });
    }

    const transaction = {
      _id: new ObjectId(),
      value,
      tags,
      name,
      description,
      userId,
      date: date ? new Date(date) : new Date(),
    };

    // Insert transaction
    await transactions.insertOne(transaction);

    // Add transaction reference to user
    await users.updateOne(
      { _id: userId },
      { $addToSet: { transactions: transaction._id } }
    );

    // Recalculate balance
    const allUserTransactions = await transactions.find({ userId }).toArray();

    const balance = allUserTransactions.reduce((acc, tx) => acc + tx.value, 0);

    // Update balance
    await users.updateOne({ _id: userId }, { $set: { balance } });

    return res.status(201).json(transaction);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        message: "Invalid data",
        errors: error.errors,
      });
    }

    console.error("Unexpected error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
