import type { NextApiRequest, NextApiResponse } from "next";
import client from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import cookie from "cookie";

// This endpoint is used to get a summary of the user's transactions
// It returns a list of tags and the sum of values for each tag
// It is used to display a summary of the user's transactions

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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

    // Use aggregation to get the sum of values for each tag
    const summary = await client
      .db()
      .collection("transactions")
      .aggregate([
        { $match: { userId: user._id } }, // Match transactions for the user
        { $unwind: "$tags" }, // Unwind the tags array to process each tag individually
        {
          $group: {
            _id: "$tags", // Group by tag
            totalValue: { $sum: "$value" }, // Sum the values for each tag
          },
        },
        { $project: { _id: 0, tag: "$_id", totalValue: 1 } }, // Project the results
      ])
      .toArray();

    // Return the summary as a map of tags to their total value
    const tagsSummary = summary.reduce((acc: any, { tag, totalValue }) => {
      acc[tag] = totalValue;
      return acc;
    }, {});

    return res.status(200).json({ data: tagsSummary });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
