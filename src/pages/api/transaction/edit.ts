import { NextApiRequest, NextApiResponse } from "next";
import client from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import cookie from "cookie";
import TransactionSchema from "@/schemas/transactionSchema";

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
  const cookies = cookie.parse(req.headers.cookie || "");
  const token = cookies.token || "";

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const user = await client
      .db()
      .collection("users")
      .findOne({ _id: new ObjectId(token) });
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

    await client.db().collection("transactions").insertOne(transaction);

    return res.status(201).json(transaction);
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
  const cookies = cookie.parse(req.headers.cookie || "");
  const token = cookies.token || "";

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const user = await client
      .db()
      .collection("users")
      .findOne({ _id: new ObjectId(token) });
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Validate and parse the request body using the updated schema
    const parsedBody = TransactionSchema.parse(req.body);

    const { _id, value, tags, name, description } = parsedBody;

    // Ensure the transaction exists in the database
    const transaction = await client
      .db()
      .collection("transactions")
      .findOne({ _id: new ObjectId(_id) });
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    // Ensure the user is the owner of the transaction
    if (transaction.userId.toString() !== user._id.toString()) {
      return res.status(403).json({
        message:
          "Forbidden: You do not have permission to edit this transaction",
      });
    }

    // Prepare the update object by conditionally updating only the fields provided
    const updatedFields: any = {};
    if (value !== undefined) updatedFields.value = value;
    if (tags !== undefined) updatedFields.tags = tags;
    if (name !== undefined) updatedFields.name = name;
    if (description !== undefined) updatedFields.description = description;

    // Update the transaction
    const updatedTransaction = {
      ...transaction,
      ...updatedFields,
      updatedAt: new Date(), // Optionally add a timestamp of the update
    };

    await client
      .db()
      .collection("transactions")
      .updateOne({ _id: new ObjectId(_id) }, { $set: updatedTransaction });

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

    return res.status(200).json(updatedTransaction);
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
