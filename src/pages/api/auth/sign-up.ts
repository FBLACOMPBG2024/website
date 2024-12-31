import { NextApiRequest, NextApiResponse } from "next";
import { generateLink } from "@/utils/generateLink";
import SignUpSchema from "@/schemas/signupSchema";
import { sendEmailVerification } from "@/utils/email";
import client from "@/lib/mongodb";
import argon2 from "argon2";

// This endpoint is used to sign up a new user
// It will create a new user in the database
// It will send an email verification link to the user's email

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === "POST") {
    // Get information from the request
    const { firstName, lastName, email, password } = req.body;

    // Validate the input data
    const result = SignUpSchema.safeParse(req.body);
    if (!result.success) {
      res
        .status(400)
        .json({ message: "Invalid input data", error: result.error });
      return;
    }

    // Check if the email is already in use
    const user = await client
      .db()
      .collection("users")
      .findOne({ email: email.toString().toLowerCase() });
    if (user) {
      res.status(400).json({ message: "Email already in use" });
      return;
    }

    // Create the user in the database
    await client
      .db()
      .collection("users")
      .insertOne({
        email: email.toString().toLowerCase(),
        password: await argon2.hash(password),
        firstName: firstName,
        lastName: lastName,
        emailVerified: false,
        createdAt: new Date(),
        balance: 0,
        transactions: [],
      });

    // Make sure all other links are older than 3 minutes
    // This is to prevent users from spamming the email verification link

    // If there are any links that are less than 3 minutes old, do not generate a new link
    const threeMinutesAgo = new Date(Date.now() - 1000 * 60 * 3);
    const links = await client
      .db()
      .collection("links")
      .find({ targetEmail: email, createdAt: { $gt: threeMinutesAgo } })
      .toArray();
    if (links.length > 0) {
      res.status(400).json({
        message: "Too many links generated recently, Try again later.",
      });
      return;
    }

    // Generate a new link
    const link = await generateLink(email, "email-verification");
    const emailResponse = await sendEmailVerification(firstName, link, email);

    // If the email failed to send, return an error
    if (!emailResponse) {
      res.status(500).json({ message: "Failed to send email" });
      return;
    }

    // If the email failed to send, return an error
    if (emailResponse.error) {
      console.error(emailResponse.error);
      res.status(500).json({ message: "Failed to send email" });

      // Delete the user from the database
      await client.db().collection("users").deleteOne({ email: email });

      return;
    }
    res
      .status(200)
      .json({ message: "Sign up successful, awaiting email verification" });
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
