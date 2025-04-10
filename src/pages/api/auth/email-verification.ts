import { NextApiRequest, NextApiResponse } from "next";
import client from "@/lib/mongodb";
import { captureEvent } from "@/utils/posthogHelper";

// Handles email verification when user clicks the link sent to their inbox

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    try {
      const { token } = req.query;

      if (!token || typeof token !== "string") {
        captureEvent("Email Verification Error - Missing Token", {
          properties: { token },
        });
        return res.status(400).json({ message: "Missing or invalid token" });
      }

      const link = await client.db().collection("links").findOne({ token });

      if (!link || link.type !== "email-verification") {
        captureEvent("Email Verification Error - Invalid Link", {
          properties: { token },
        });
        return res.status(404).json({ message: "Invalid link" });
      }

      if (link.expires < new Date()) {
        captureEvent("Email Verification Error - Expired Link", {
          properties: { token, expires: link.expires },
        });
        return res.status(400).json({ message: "Link has expired" });
      }

      const updateUserResult = await client
        .db()
        .collection("users")
        .updateOne(
          { email: link.targetEmail },
          { $set: { emailVerified: true } }
        );

      if (updateUserResult.modifiedCount === 0) {
        captureEvent("Email Verification Error - User Update Failed", {
          properties: { email: link.targetEmail },
        });
        return res.status(500).json({ message: "Failed to update user" });
      }

      const updateLinkResult = await client
        .db()
        .collection("links")
        .updateOne({ token }, { $set: { used: true, usedAt: new Date() } });

      if (updateLinkResult.modifiedCount === 0) {
        captureEvent("Email Verification Error - Link Update Failed", {
          properties: { token },
        });
        return res.status(500).json({ message: "Failed to mark link as used" });
      }

      captureEvent("Email Verified", {
        properties: {
          email: link.targetEmail,
          tokenUsed: token,
        },
      });

      const redirectUrl = process.env.URL
        ? `${process.env.URL}/email/verified`
        : "/email/verified"; // fallback just in case

      return res.status(200).redirect(redirectUrl);
    } catch (error: any) {
      captureEvent("Email Verification Error - Unknown", {
        properties: { error: error?.toString() },
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
