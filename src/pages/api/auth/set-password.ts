import { NextApiRequest, NextApiResponse } from "next";
import client from "@/lib/mongodb";
import argon2 from "argon2";

// This endpoint is used to set the user's password
// It is called when the user submits the password reset form
// It will update the user's password in the database

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {
      // Get token and password from request body
      const { token, password } = req.body;

      if (!token || !password) {
        return res
          .status(400)
          .json({ message: "Token and password are required" });
      }

      // Find the link that matches the token
      const link = await client.db().collection("links").findOne({ token });

      // Ensure the link exists and is of the type "reset-password"
      if (!link || link.type !== "reset-password") {
        console.log(`Invalid link: ${token}`);
        return res.status(404).json({ message: "Invalid link" });
      }

      // Check if the link has expired
      if (link.expires < new Date()) {
        console.log(`Link expired: ${token}`);
        return res.status(404).json({ message: "Link expired" });
      }

      // Check if the user has clicked the link before
      if (!link.used) {
        console.log(`User has not clicked link: ${token}`);
        return res.status(400).json({ message: "User has not clicked link" });
      }

      // Validate password length
      if (password.length < 8) {
        return res
          .status(400)
          .json({ message: "Password must be at least 8 characters" });
      }

      // Hash the new password securely using Argon2
      const newPassword = await argon2.hash(password);

      // Update the user's password in the database
      const result = await client
        .db()
        .collection("users")
        .updateOne(
          { email: link.targetEmail },
          { $set: { password: newPassword, resetPassword: false } }
        );

      if (result.modifiedCount === 0) {
        console.log(`Failed to update password for user: ${link.targetEmail}`);
        return res.status(500).json({ message: "Failed to update password" });
      }

      // Mark the link as used
      await client
        .db()
        .collection("links")
        .updateOne({ token }, { $set: { used: true, usedAt: new Date() } });

      res.status(200).json({ message: "Password updated successfully" });
    } catch (error: any) {
      console.error("Error updating password:", error.message);
      res.status(500).json({ message: "Internal server error" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
