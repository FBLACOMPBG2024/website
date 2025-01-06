import TransactionSchema from "@/schemas/transactionSchema";
import { NextApiRequest, NextApiResponse } from "next";
import client from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/utils/sessionConfig";
import { SessionData } from "@/utils/sessionData";

// This endpoint is used to create and edit transactions
// It is used to create a new transaction and edit an existing transaction

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    return await createTransaction(req, res);
  } else if (req.method === "PUT") {
    return await editTransaction(req, res);
  } else {
    res.setHeader("Allow", ["POST", "PUT"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

// Handle creating a new transaction (same as before)
async function createTransaction(req: NextApiRequest, res: NextApiResponse) {
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

    const parsedBody = TransactionSchema.parse(req.body); // Still using the update schema
    const { value, tags, name, description } = parsedBody;

    const transaction = {
      _id: new ObjectId(),
      value,
      tags,
      name,
      description,
      userId: user._id,
    };

    try {
      await client.db().collection("transactions").insertOne(transaction);

      // Update user balance by adding the value of the new transaction
      const newBalance = user.balance + value;
      await client
        .db()
        .collection("users")
        .updateOne({ _id: user._id }, { $set: { balance: newBalance } });
      return res.status(201).json(transaction);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  } catch (error: any) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        message: "Invalid data",
        errors: error.errors,
      });
    }

    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

// Handle editing an existing transaction
async function editTransaction(req: NextApiRequest, res: NextApiResponse) {
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

    const parsedBody = TransactionSchema.parse(req.body);
    const { _id, value, tags, name, description } = parsedBody;

    if (!_id) {
      return res.status(400).json({ message: "Transaction ID is required" });
    }

    const transaction = await client
      .db()
      .collection("transactions")
      .findOne({ _id: new ObjectId(_id), userId: user._id });

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    // Prepare update fields
    const updatedFields: any = {};
    if (value !== undefined) updatedFields.value = value;
    if (tags !== undefined) updatedFields.tags = tags;
    if (name !== undefined) updatedFields.name = name;
    if (description !== undefined) updatedFields.description = description;

    // Update transaction
    const updatedTransaction = {
      ...transaction,
      ...updatedFields,
      updatedAt: new Date(),
    };

    // Adjust balance: subtract old value and add new value
    const balanceAdjustment = (value || 0) - (transaction.value || 0);

    try {
      await client
        .db()
        .collection("transactions")
        .updateOne({ _id: new ObjectId(_id) }, { $set: updatedTransaction });

      // Update user balance
      const newBalance = user.balance + balanceAdjustment;
      await client
        .db()
        .collection("users")
        .updateOne({ _id: user._id }, { $set: { balance: newBalance } });

      return res.status(200).json(updatedTransaction);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  } catch (error: any) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        message: "Invalid data",
        errors: error.errors,
      });
    }

    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
