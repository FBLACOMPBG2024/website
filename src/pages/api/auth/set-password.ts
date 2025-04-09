import { NextApiRequest, NextApiResponse } from "next";
import client from "@/lib/mongodb";
import argon2 from "argon2";
import { captureEvent } from "@/utils/posthogHelper";

// This endpoint is used to set the user's password
// It is called when the user submits the password reset form
// It will update the user's password in the database

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {
      const { token, password } = req.body;

      if (!token || !password) {
        return res
          .status(400)
          .json({ message: "Token and password are required" });
      }

      const link = await client.db().collection("links").findOne({ token });

      if (!link || link.type !== "reset-password") {
        captureEvent("Invalid Password Reset Link", {
          properties: {
            reason: "Invalid link or incorrect type",
            token,
          },
        });
        return res.status(404).json({ message: "Invalid link" });
      }

      if (link.expires < new Date()) {
        captureEvent("Expired Password Reset Link", {
          properties: {
            token,
            expiredAt: link.expires,
          },
        });
        return res.status(404).json({ message: "Link expired" });
      }

      if (!link.used) {
        captureEvent("Unclicked Password Reset Link", {
          properties: {
            token,
            targetEmail: link.targetEmail,
          },
        });
        return res.status(400).json({ message: "User has not clicked link" });
      }

      if (password.length < 8) {
        return res
          .status(400)
          .json({ message: "Password must be at least 8 characters" });
      }

      const newPassword = await argon2.hash(password);

      const result = await client
        .db()
        .collection("users")
        .updateOne(
          { email: link.targetEmail },
          { $set: { password: newPassword, resetPassword: false } }
        );

      if (result.modifiedCount === 0) {
        captureEvent("Password Update Failed", {
          properties: {
            token,
            targetEmail: link.targetEmail,
          },
        });
        return res.status(500).json({ message: "Failed to update password" });
      }

      await client
        .db()
        .collection("links")
        .updateOne({ token }, { $set: { used: true, usedAt: new Date() } });

      captureEvent("Password Successfully Updated", {
        properties: {
          targetEmail: link.targetEmail,
          token,
        },
      });

      res.status(200).json({ message: "Password updated successfully" });
    } catch (error: any) {
      captureEvent("Password Update Error", {
        properties: {
          error,
          token: req.body?.token,
        },
      });
      res.status(500).json({ message: "Internal server error" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
