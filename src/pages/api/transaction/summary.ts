import type { NextApiRequest, NextApiResponse } from "next";
import client from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/utils/sessionConfig";
import { SessionData } from "@/utils/sessionData";

// New endpoint to get weekly spending grouped by day of the week
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
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
    const session = await getIronSession<SessionData>(req, res, sessionOptions);

    // Ensure the user is authenticated
    if (!session.user?._id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = session.user._id;

    // Define the date range: from 7 days ago to now
    const now = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);

    // Query transactions directly for the last 7 days
    const transactions = await client
      .db()
      .collection("transactions")
      .find({
        userId: new ObjectId(userId),
        date: { $gte: sevenDaysAgo },
      })
      .sort({ date: 1 })
      .toArray();

    // Define the days of the week
    const weekday = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    // Group transactions by day of the week
    const weeklySpending = Array.from({ length: 7 }, (_, i) => {
      const day = new Date(sevenDaysAgo);
      day.setDate(day.getDate() + i);
      const dayOfWeek = day.getDay();

      // Calculate the total spending for the current day
      const totalForDay = transactions.reduce((acc, transaction) => {
        const transactionDay = new Date(transaction.date).getDay();
        return transactionDay === dayOfWeek && transaction.value < 0
          ? acc + Math.abs(transaction.value)
          : acc;
      }, 0);

      return {
        day: weekday[dayOfWeek],
        total: totalForDay,
      };
    });

    const labels = weeklySpending.map((day) => day.day);
    const data = weeklySpending.map((day) => day.total);

    return res.status(200).json({ labels, data });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
