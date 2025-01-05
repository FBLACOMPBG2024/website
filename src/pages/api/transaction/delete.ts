import { NextApiRequest, NextApiResponse } from "next";
import client from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/utils/sessionConfig";

// This endpoint is used to delete a transaction
// It is used to delete a transaction from the user's transaction list, using the transaction ID to delete the transaction

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === "DELETE") {
    try {
      // Get session
      const session = await getIronSession(req, res, sessionOptions);

      if (!session.user?._id) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      // Get the user from the database
      const user = await client
        .db()
        .collection("users")
        .findOne({ _id: new ObjectId(session.user?._id) });

      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      // Get the transaction ID from the request body
      const { _id } = req.body;

      if (!ObjectId.isValid(_id)) {
        return res.status(400).json({ message: "Invalid transaction ID" });
      }

      // Delete the transaction from the database
      const transaction = await client
        .db()
        .collection("transactions")
        .findOne({ _id: new ObjectId(_id), userId: user._id });

      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }

      const result = await client
        .db()
        .collection("transactions")
        .deleteOne({ _id: new ObjectId(_id), userId: user._id });

      if (result.deletedCount === 0) {
        return res.status(404).json({ message: "Transaction not found" });
      }

      // Update user transaction list
      await client
        .db()
        .collection("users")
        .updateOne(
          { _id: user._id },
          {
            $pull: {
              transactions: new ObjectId(_id),
            },
          },
        );

      // Update the balance by subtracting the value of the deleted transaction
      const newBalance = user.balance - transaction.value;

      // Update user balance
      await client
        .db()
        .collection("users")
        .updateOne({ _id: user._id }, { $set: { balance: newBalance } });

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
