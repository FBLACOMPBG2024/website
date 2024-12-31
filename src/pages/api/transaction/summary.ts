import type { NextApiRequest, NextApiResponse } from "next";
import client from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import cookie from "cookie";

// This endpoint is used to get a summary of the user's transactions
// It returns a list of tags and the sum of values for each tag
// It is used to display a summary of the user's transactions

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === "GET") {
    return await getSummary(req, res);
  } else {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

async function getSummary(req: NextApiRequest, res: NextApiResponse) {
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

    // Make a list of tags and a value sum for each tag
    const tags: { [key: string]: number } = {};
    for (const transaction of transactions) {
      for (const tag of transaction.tags) {
        tags[tag] = (tags[tag] || 0) + transaction.value;
      }
    }

    // Return the summary
    return res.status(200).json({ data: tags });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
