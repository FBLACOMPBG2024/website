import { NextApiRequest, NextApiResponse } from "next";
import client from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/utils/sessionConfig";
import { SessionData } from "@/utils/sessionData";
import { Transaction } from "@/schemas/transactionSchema";
import { User } from "@/schemas/userSchema";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "DELETE") {
    res.setHeader("Allow", ["DELETE"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const session = await getIronSession<SessionData>(req, res, sessionOptions);
    if (!session.user?._id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = new ObjectId(session.user._id);
    const { _id } = req.body;

    if (!ObjectId.isValid(_id)) {
      return res.status(400).json({ message: "Invalid transaction ID" });
    }

    const db = client.db();
    const users = client.db().collection<User>("users");
    const transactions = db.collection<Transaction>("transactions");

    const user = await users.findOne({ _id: userId });
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const txId = new ObjectId(_id);

    const foundTx = await transactions.findOne({
      _id: new ObjectId(txId),
      userId,
    });
    if (!foundTx) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    // Delete transaction
    const deleteResult = await transactions.deleteOne({
      _id: new ObjectId(txId),
      userId,
    });
    if (deleteResult.deletedCount === 0) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    await users.updateOne(
      { _id: userId },
      { $pull: { transactions: new ObjectId(txId) } }
    );

    // Recalculate balance
    const remaining = await transactions.find({ userId }).toArray();
    const newBalance = remaining.reduce((acc, tx) => acc + tx.value, 0);

    await users.updateOne({ _id: userId }, { $set: { balance: newBalance } });

    return res
      .status(200)
      .json({ message: "Transaction deleted successfully" });
  } catch (err) {
    console.error("Delete error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}
