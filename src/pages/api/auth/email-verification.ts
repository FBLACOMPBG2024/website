import { NextApiRequest, NextApiResponse } from "next";
import client from "@/lib/mongodb";

// This file defines the API route that allows the user to verify their email
// It checks if the link is valid and not expired
// It marks the user's email as verified
// And marks the link as used
// It then redirects the user to the email verified page

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === "GET") {
    // Check if the token is present
    const link = await client
      .db()
      .collection("links")
      .findOne({ token: req.query.token });

    // Check if the link is valid
    if (!link || link.type !== "email-verification") {
      res.status(404).json({ message: "Invalid link" });
      return;
    }

    // Check if the link is expired
    if (link.expires < new Date()) {
      res.status(404).json({ message: "Link expired" });
      return;
    }

    // Mark the user's email as verified
    const user = await client
      .db()
      .collection("users")
      .updateOne(
        { email: link.targetEmail },
        { $set: { emailVerified: true } },
      );

    // Mark the link as used
    await client
      .db()
      .collection("links")
      .updateOne(
        { token: req.query.token },
        { $set: { used: true, usedAt: new Date(Date.now()) } },
      );

    // Redirect the user to the email verified page
    res.status(200).redirect(process.env.URL + "/email/verified");
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
