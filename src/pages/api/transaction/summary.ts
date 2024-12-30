import type { NextApiRequest, NextApiResponse } from "next";
import client from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import cookie from "cookie";

type Transaction = {
  value: number;
  name: string;
};

type SummaryResponse = {
  data: Transaction[];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SummaryResponse>
) {
  if (req.method === "GET") {
    return await getSummary(req, res);
  } else {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

async function getSummary(
  req: NextApiRequest,
  res: NextApiResponse<SummaryResponse>
) {
  try {
    const cookies = cookie.parse(req.headers.cookie || "");
    const token = cookies.token || "";

    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Get the user from the database
    const user = await client
      .db()
      .collection("users")
      .findOne({ _id: new ObjectId(token) });
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Fetch the user's transactions
    const transactions = await client
      .db()
      .collection("transactions")
      .find({ userId: user._id })
      .toArray();

    // Calculate the summary
    const summary = transactions.reduce((acc, transaction) => {
      if (transaction.value > 0) {
        acc.push({
          value: transaction.value,
          name: transaction.name,
        });
      }
      return acc;
    }, [] as Transaction[]);

    return res.status(200).json(summary);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
