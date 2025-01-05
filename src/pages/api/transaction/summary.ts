import type { NextApiRequest, NextApiResponse } from "next";
import client from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/utils/sessionConfig";

// New endpoint to get weekly spending grouped by day of the week
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === "GET") {
    return await getWeeklySpending(req, res);
  } else {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

// Get weekly spending grouped by day of the week
async function getWeeklySpending(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getIronSession(req, res, sessionOptions);

    // Ensure the user is authenticated
    if (!session.user?._id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = session.user._id;

    // Define the date range: from 7 days ago to now
    const now = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);

    // Query transactions in the last 7 days
    const transactions = await client
      .db()
      .collection("transactions")
      .aggregate([
        {
          $match: {
            userId: new ObjectId(userId),
            date: { $gte: sevenDaysAgo, $lt: now },
          },
        },
        {
          $project: {
            dayOfWeek: { $dayOfWeek: "$date" }, // Extract day of the week
            deduction: {
              $cond: [{ $lt: ["$value", 0] }, { $abs: "$value" }, 0], // Include only negative values
            },
          },
        },
        {
          $group: {
            _id: "$dayOfWeek",
            totalDeductions: { $sum: "$deduction" }, // Sum deductions per day
          },
        },
      ])
      .toArray();

    // Map MongoDB day-of-week (1=Sun, 7=Sat) to custom day names
    const daysOrder = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    // Initialize the grouped data with all days set to 0
    const groupedData = daysOrder.reduce(
      (acc, day) => {
        acc[day] = 0; // Default to 0 for all days
        return acc;
      },
      {} as Record<string, number>,
    );

    // Populate groupedData with actual transaction data
    transactions.forEach(({ _id, totalDeductions }) => {
      const dayName = daysOrder[_id - 1]; // Map day number to name
      groupedData[dayName] = totalDeductions;
    });

    return res.status(200).json({
      data: groupedData,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
