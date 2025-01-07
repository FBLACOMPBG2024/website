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

    // We now want to get all transactions for the user in the last 7 days
    const transactions = await client
      .db()
      .collection("transactions")
      .find({
        userId: new ObjectId(userId),
        date: { $gte: sevenDaysAgo, $lte: now },
      })
      .toArray();

    console.log("Transactions:", transactions);
    console.log("Now", now);
    console.log("7 days ago", sevenDaysAgo.getTime());

    // Group the transactions by day of the week
    // Get every day of the week
    const weekday = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const weeklySpending = Array.from({ length: 7 }, (_, i) => {
      const day = new Date(sevenDaysAgo);
      day.setDate(day.getDate() + i);
      return {
        day: weekday[day.getDay()],
        total: transactions.reduce((acc, transaction) => {
          const transactionDay = new Date(transaction.date).getDay();
          return transactionDay === day.getDay()
            ? acc + transaction.value
            : acc;
        }, 0),
      };
    });

    // Reverse the array so that the first day of the week is Sunday
    weeklySpending.reverse();

    const labels = weeklySpending.map((day) => day.day);
    const data = weeklySpending.map((day) => day.total);

    console.log("Labels:", labels);
    console.log("Data:", data);

    return res.status(200).json({ labels, data });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
