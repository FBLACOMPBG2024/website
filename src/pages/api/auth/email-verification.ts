import { NextApiRequest, NextApiResponse } from "next";
import client from "@/lib/mongodb";
import { captureEvent } from "@/utils/posthogHelper";

// This file defines the API route that allows the user to verify their email
// It checks if the link is valid and not expired
// It marks the user's email as verified
// And marks the link as used
// It then redirects the user to the email verified page

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    try {
      const { token } = req.query;

      // Check if the token is present
      if (!token || typeof token !== "string") {
        return res.status(400).json({ message: "Missing or invalid token" });
      }

      // Fetch the link data from the database
      const link = await client.db().collection("links").findOne({ token });

      // Check if the link is valid
      if (!link || link.type !== "email-verification") {
        return res.status(404).json({ message: "Invalid link" });
      }

      // Check if the link is expired
      if (link.expires < new Date()) {
        return res.status(400).json({ message: "Link has expired" });
      }

      // Mark the user's email as verified
      const updateUserResult = await client
        .db()
        .collection("users")
        .updateOne(
          { email: link.targetEmail },
          { $set: { emailVerified: true } }
        );

      if (updateUserResult.modifiedCount === 0) {
        return res.status(500).json({ message: "Failed to update user" });
      }

      // Mark the link as used
      const updateLinkResult = await client
        .db()
        .collection("links")
        .updateOne(
          { token },
          { $set: { used: true, usedAt: new Date(Date.now()) } }
        );

      if (updateLinkResult.modifiedCount === 0) {
        return res.status(500).json({ message: "Failed to mark link as used" });
      }

      // Track successful verification
      captureEvent("Email Verified", {
        properties: {
          email: link.targetEmail,
          tokenUsed: token,
        },
      });

      // Redirect the user to the email verified page
      res.status(200).redirect(process.env.URL + "/email/verified");
    } catch (error: any) {
      captureEvent("Email Verification Error", {
        properties: {
          error,
        },
      });

      return res
        .status(500)
        .json({ message: "An error occurred during verification" });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
