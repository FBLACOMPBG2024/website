import { NextApiRequest, NextApiResponse } from "next";
import client from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import cookie from "cookie";

// This endpoint is used to refresh the user's information
// It is called when the user navigates to the dashboard
// It will update the user's balance and return the user's information

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === "GET") {
    const cookies = cookie.parse(req.headers.cookie || "");
    const token = cookies.token || "";

    if (!token) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // Get the user from the database
    const user = await client
      .db()
      .collection("users")
      .findOne({ _id: new ObjectId(token) });

    if (!user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // Get all transactions for the user
    const transactions = await client
      .db()
      .collection("transactions")
      .find({ userId: user._id })
      .toArray();

    // Calculate the balance
    const balance = transactions.reduce(
      (acc, transaction) => acc + transaction.value,
      0,
    );

    // Update user balance
    await client
      .db()
      .collection("users")
      .updateOne({ _id: user._id }, { $set: { balance: balance } });

    // Return the user's information
    if (!user.emailVerified) {
      res.status(401).json({ message: "Awaiting email verification" });
      return;
    }

    // Set the token in a cookie
    res.setHeader(
      "Set-Cookie",
      cookie.serialize("token", user._id.toString(), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7, // 1 week
        sameSite: "strict",
        path: "/",
      }),
    );

    res.status(200).json({ message: "Refresh successful", user: user });
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
