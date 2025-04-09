import { NextApiRequest, NextApiResponse } from "next";
import { generateLink } from "@/utils/generateLink";
import { sendEmailVerification } from "@/utils/email";
import client from "@/lib/mongodb";
import { captureEvent } from "@/utils/posthogHelper";

// This endpoint is used to resend the email verification link
// It is called when the user clicks the "resend email" button
// It will generate a new link and send it to the user's email

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    try {
      const user = await client
        .db()
        .collection("users")
        .findOne({ email: email });

      if (!user) {
        return res.status(400).json({ message: "User not found" });
      }

      if (user.emailVerified) {
        return res.status(400).json({ message: "Email already verified" });
      }

      if (process.env.NODE_ENV !== "development") {
        const threeMinutesAgo = new Date(Date.now() - 1000 * 60 * 3);
        const links = await client
          .db()
          .collection("links")
          .find({ targetEmail: email, createdAt: { $gt: threeMinutesAgo } })
          .toArray();

        if (links.length > 0) {
          return res.status(400).json({
            message: "Too many emails sent recently, Try again later.",
          });
        }
      }

      const link = await generateLink(email, "email-verification");

      const emailResponse = await sendEmailVerification(
        user.firstName,
        link,
        email
      );

      if (!emailResponse) {
        captureEvent("Email Verification Resend Error", {
          properties: {
            error: "Failed to send email",
            email,
          },
        });
        return res.status(500).json({ message: "Failed to send email" });
      }

      res.status(200).json({ message: "Email sent" });
    } catch (error: any) {
      captureEvent("Email Verification Resend Exception", {
        properties: {
          error,
          email,
        },
      });
      res.status(500).json({ message: "Internal server error" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
