import { NextApiRequest, NextApiResponse } from "next";
import client from "@/lib/mongodb";
import argon2 from "argon2";

// This endpoint is used to set the user's password
// It is called when the user submits the password reset form
// It will update the user's password in the database

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === "POST") {
    // Get token from request body
    const { token, password } = req.body;

    // Find the link that matches the token
    const link = await client.db().collection("links").findOne({ token });

    // Ensure the link exists and is of the type "set-password"
    if (!link || link.type !== "reset-password") {
      res.status(404).json({ message: "Invalid link" });
      return;
    }

    // Check if the link has expired
    if (link.expires < new Date()) {
      res.status(404).json({ message: "Link expired" });
      return;
    }

    // Check if the user has clicked the link before
    if (!link.used) {
      res.status(400).json({ message: "User has not clicked link" });
      return;
    }

    // Check password requirements
    if (password.length < 8) {
      res
        .status(400)
        .json({ message: "Password must be at least 8 characters" });
      return;
    }

    // Hash the new password
    const newPassword = await argon2.hash(password);

    // Update the user's password
    await client
      .db()
      .collection("users")
      .updateOne(
        { email: link.targetEmail },
        { $set: { password: newPassword } },
      );

    res.status(200).json({ message: "Password updated" });
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
