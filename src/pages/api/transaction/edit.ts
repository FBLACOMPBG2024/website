import { NextApiRequest, NextApiResponse } from "next";
import client from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/utils/sessionConfig";
import { SessionData } from "@/utils/sessionData";
import TransactionSchema from "@/schemas/transactionSchema";

async function getUserFromSession(req: NextApiRequest, res: NextApiResponse) {
  const session = await getIronSession<SessionData>(req, res, sessionOptions);

  if (!session.user?._id) {
    return null;
  }

  const user = await client
    .db()
    .collection("users")
    .findOne({ _id: new ObjectId(session.user._id) });

  return user;
}

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

async function createTransaction(req: NextApiRequest, res: NextApiResponse) {
  const user = await getUserFromSession(req, res);
  if (!user) return res.status(401).json({ message: "Unauthorized" });

  const parsedBody = TransactionSchema.parse(req.body);
  const { value, tags, name, description } = parsedBody;

  const transaction = {
    _id: new ObjectId(),
    value,
    tags,
    name,
    description,
    userId: user._id,
  };

  const sessionDb = client.startSession();
  sessionDb.startTransaction();

  try {
    await client
      .db()
      .collection("transactions")
      .insertOne(transaction, { session: sessionDb });
    const newBalance = user.balance + value;
    await client
      .db()
      .collection("users")
      .updateOne(
        { _id: user._id },
        { $set: { balance: newBalance } },
        { session: sessionDb }
      );

    await sessionDb.commitTransaction();
    sessionDb.endSession();

    return res.status(201).json(transaction);
  } catch (error) {
    console.error(error);
    await sessionDb.abortTransaction();
    sessionDb.endSession();
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

async function editTransaction(req: NextApiRequest, res: NextApiResponse) {
  const user = await getUserFromSession(req, res);
  if (!user) return res.status(401).json({ message: "Unauthorized" });

  // Parse and validate the request body
  let parsedBody;
  try {
    parsedBody = TransactionSchema.parse(req.body);
  } catch (error: any) {
    return res
      .status(400)
      .json({ message: "Invalid request data", errors: error.errors });
  }

  const { _id, value, tags, name, description } = parsedBody;

  if (!_id)
    return res.status(400).json({ message: "Transaction ID is required" });

  const transaction = await client
    .db()
    .collection("transactions")
    .findOne({ _id: new ObjectId(_id), userId: user._id });
  if (!transaction)
    return res.status(404).json({ message: "Transaction not found" });

  const sessionDb = client.startSession();
  sessionDb.startTransaction();

  try {
    const updatedFields: any = {};

    if (value !== undefined) {
      updatedFields.value = value;
    }
    if (tags !== undefined) updatedFields.tags = tags;
    if (name !== undefined) updatedFields.name = name;
    if (description !== undefined) updatedFields.description = description;

    const balanceAdjustment = (value || 0) - (transaction.value || 0);
    await client
      .db()
      .collection("transactions")
      .updateOne(
        { _id: new ObjectId(_id) },
        { $set: { ...updatedFields, updatedAt: new Date() } },
        { session: sessionDb }
      );

    const newBalance = user.balance + balanceAdjustment;
    await client
      .db()
      .collection("users")
      .updateOne(
        { _id: user._id },
        { $set: { balance: newBalance } },
        { session: sessionDb }
      );

    await sessionDb.commitTransaction();
    sessionDb.endSession();

    return res.status(200).json({ ...transaction, ...updatedFields });
  } catch (error) {
    console.error(error);
    await sessionDb.abortTransaction();
    sessionDb.endSession();
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
