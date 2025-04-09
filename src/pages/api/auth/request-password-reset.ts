import { NextApiRequest, NextApiResponse } from "next";
import { generateLink } from "@/utils/generateLink";
import { sendPasswordReset } from "@/utils/email";
import client from "@/lib/mongodb";
import { captureEvent } from "@/utils/posthogHelper";

// This endpoint is used to request a password reset link
// It is called when the user clicks the "forgot password" button
// It will generate a new link and send it to the user's email

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    let { email } = req.body;
    email = email.toLowerCase();

    try {
      // Get the user from the database
      const user = await client
        .db()
        .collection("users")
        .findOne({ email: email });

      // If the user does not exist, return an error
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (process.env.NODE_ENV !== "development") {
        // Only check in production
        const threeMinutesAgo = new Date(Date.now() - 1000 * 60 * 3);
        const links = await client
          .db()
          .collection("links")
          .find({
            type: "reset-password",
            targetEmail: email,
            createdAt: { $gt: threeMinutesAgo },
          })
          .toArray();

        if (links.length > 0) {
          return res.status(400).json({
            message: "Too many emails sent recently, Try again later.",
          });
        }
      }

      // Generate a new reset password link
      const link = await generateLink(user.email, "reset-password");

      // Send the link to the user's email
      const emailResponse = await sendPasswordReset(
        user.firstName,
        link,
        user.email
      );

      if (!emailResponse || emailResponse.error) {
        captureEvent("Password Reset Email Error", {
          properties: {
            error: emailResponse?.error || "Failed to send email",
            email: user.email,
          },
        });
        return res.status(500).json({ message: "Failed to send reset email" });
      }

      // Return a success message
      res.status(200).json({ message: "Email sent" });
    } catch (error: any) {
      captureEvent("Password Reset Request Error", {
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
