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
      return res
        .status(400)
        .json({ message: "Invalid input data", error: result.error });
    }

    const normalizedEmail = email.toString().toLowerCase();

    // Check if the email is already in use
    const existingUser = await client
      .db()
      .collection("users")
      .findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    // Create the user in the database
    const hashedPassword = await argon2.hash(password);
    await client.db().collection("users").insertOne({
      email: normalizedEmail,
      password: hashedPassword,
      firstName,
      lastName,
      emailVerified: false,
      createdAt: new Date(),
      balance: 0,
      preferences: {
        theme: "dark"
      }
    });

    // Prevent generating multiple verification links within 3 minutes
    const threeMinutesAgo = new Date(Date.now() - 1000 * 60 * 3);
    const existingLinks = await client
      .db()
      .collection("links")
      .find({
        targetEmail: normalizedEmail,
        createdAt: { $gt: threeMinutesAgo },
      })
      .toArray();

    if (existingLinks.length > 0) {
      return res
        .status(400)
        .json({
          message: "Too many links generated recently, Try again later.",
        });
    }

    // Generate and send the email verification link
    const link = await generateLink(normalizedEmail, "email-verification");
    const emailResponse = await sendEmailVerification(
      firstName,
      link,
      normalizedEmail,
    );

    // If sending the email failed, delete the user and return an error
    if (!emailResponse || emailResponse.error) {
      console.error(emailResponse?.error || "Email failed to send");
      await client
        .db()
        .collection("users")
        .deleteOne({ email: normalizedEmail });
      return res.status(500).json({ message: "Failed to send email" });
    }

    res
      .status(200)
      .json({ message: "Sign up successful, awaiting email verification" });
  } else {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
