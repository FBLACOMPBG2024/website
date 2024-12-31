import { NextApiRequest, NextApiResponse } from "next";
import client from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import cookie from "cookie";

// This endpoint is used to get the user's transactions
// It returns a list of transactions for the user
// It can be filtered by tag, date range, and limit

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === "GET") {
    return await getTransactions(req, res);
  } else {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

// Get transactions for a user
async function getTransactions(req: NextApiRequest, res: NextApiResponse) {
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

    // Parse query parameters
    const { limit = 10, startDate, endDate, filter } = req.query;

    // Convert `limit` to a number
    const limitNumber = parseInt(limit as string, 10);
    if (isNaN(limitNumber) || limitNumber <= 0) {
      return res.status(400).json({ message: "Invalid limit value" });
    }

    // Build the date range filter
    const dateFilter: any = {};
    if (startDate) {
      const parsedStartDate = new Date(startDate as string);
      if (isNaN(parsedStartDate.getTime())) {
        return res.status(400).json({ message: "Invalid startDate format" });
      }
      dateFilter.date = { $gte: parsedStartDate };
    }
    if (endDate) {
      const parsedEndDate = new Date(endDate as string);
      if (isNaN(parsedEndDate.getTime())) {
        return res.status(400).json({ message: "Invalid endDate format" });
      }
      // Make sure the end date is inclusive
      dateFilter.date = { ...dateFilter.date, $lte: parsedEndDate };
    }

    // Parse and validate the filter (tags) parameter
    let tagsFilter: any = {};
    if (filter) {
      let tags: string[] = [];
      try {
        tags = JSON.parse(filter as string);
        if (
          !Array.isArray(tags) ||
          tags.some((tag) => typeof tag !== "string")
        ) {
          return res.status(400).json({
            message: "Invalid filter format. Must be an array of strings.",
          });
        }
      } catch {
        return res.status(400).json({
          message: "Invalid filter format. Must be a JSON array of strings.",
        });
      }
      tagsFilter.tags = { $all: tags }; // Match transactions containing all specified tags
    }

    // Query the database to get the user's transactions with optional filters
    const transactions = await client
      .db()
      .collection("transactions")
      .find({
        userId: user._id,
        ...dateFilter, // Apply the date filter if provided
        ...tagsFilter, // Apply the tags filter if provided
      })
      .sort({ date: -1 }) // Sort by creation date, descending
      .limit(limitNumber) // Apply the limit
      .toArray();

    // Return the transactions to the client
    return res.status(200).json(transactions);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
