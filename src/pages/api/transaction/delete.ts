import { NextApiRequest, NextApiResponse } from "next";
import client from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import cookie from "cookie";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "DELETE") {
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

      // Get the transaction ID from the request body
      const { transactionId } = req.body;

      if (!ObjectId.isValid(transactionId)) {
        return res.status(400).json({ message: "Invalid transaction ID" });
      }

      // Delete the transaction from the database
      const result = await client
        .db()
        .collection("transactions")
        .deleteOne({ _id: new ObjectId(transactionId), userId: user._id });

      if (result.deletedCount === 0) {
        return res.status(404).json({ message: "Transaction not found" });
      }

      // Update user transaction list
      await client
        .db()
        .collection("users")
        .updateOne(
          { _id: user._id },
          { $pull: { transactions: new ObjectId(transactionId) } }
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

      // Respond with a success message
      return res
        .status(200)
        .json({ message: "Transaction deleted successfully" });
    } catch (error: any) {
      console.error(error); // Log any unexpected errors
      return res.status(500).json({ message: "Internal Server Error" });
    }
  } else {
    // Method not allowed for other HTTP methods
    res.setHeader("Allow", ["DELETE"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
