import { NextApiRequest, NextApiResponse } from "next";
import { generateLink } from "@/utils/generateLink";
import { sendPasswordReset } from "@/utils/email";
import client from "@/lib/mongodb";

// This endpoint is used to request a password reset link
// It is called when the user clicks the "forgot password" button
// It will generate a new link and send it to the user's email

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === "POST") {
    // Get the email from the request body
    let { email } = req.body;

    email = email.toLowerCase();

    // Get the user from the database
    const user = await client
      .db()
      .collection("users")
      .findOne({ email: email });

    // If the user does not exist, return an error
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the user already has a reset password link that is less than 3 minutes old
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

    // If there are any links that are less than 3 minutes old, do not generate a new link
    if (links.length > 0) {
      return res
        .status(400)
        .json({ message: "Too many emails sent recently, Try again later." });
    }

    // If the user has a valid email, generate a new link with the type "reset-password"
    const link = await generateLink(user.email, "reset-password");

    // Send the link to the user's email
    sendPasswordReset(user.firstName, link, user.email);

    // Return a success message
    res.status(200).json({ message: "Email sent" });
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
