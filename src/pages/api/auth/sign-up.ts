import { NextApiRequest, NextApiResponse } from "next";
import { generateLink } from "@/utils/generateLink";
import SignUpSchema from "@/schemas/signupSchema";
import { sendEmailVerification } from "@/utils/email";
import client from "@/lib/mongodb";
import argon2 from "argon2";
import { captureEvent } from "@/utils/posthogHelper";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { firstName, lastName, email, password } = req.body;

  // Validate input data against the signup schema
  const result = SignUpSchema.safeParse(req.body);
  if (!result.success) {
    return res
      .status(400)
      .json({ message: "Invalid input data", error: result.error });
  }

  const normalizedEmail = email.toString().toLowerCase();

  try {
    const db = client.db();
    const users = db.collection("users");
    const links = db.collection("links");

    // Bail if there's already a user with this email
    const existingUser = await users.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    // Hash the password before saving anything
    const hashedPassword = await argon2.hash(password);

    const newUser = {
      email: normalizedEmail,
      password: hashedPassword,
      firstName,
      lastName,
      emailVerified: false,
      createdAt: new Date(),
      balance: 0,
      preferences: {
        theme: "system",
        accountId: "",
      },
    };

    // Prevent spamming by checking for recent verification links
    const threeMinutesAgo = new Date(Date.now() - 1000 * 60 * 3);
    const existingLinks = await links
      .find({
        targetEmail: normalizedEmail,
        createdAt: { $gt: threeMinutesAgo },
      })
      .toArray();

    if (existingLinks.length > 0) {
      return res.status(400).json({
        message: "Too many links generated recently, try again later.",
      });
    }

    // Create the user
    await users.insertOne(newUser);

    captureEvent("User Signup Success", {
      properties: {
        email: normalizedEmail,
        method: "email-password",
      },
    });

    // Generate email verification link and send it
    const link = await generateLink(normalizedEmail, "email-verification");
    const emailResponse = await sendEmailVerification(
      firstName,
      link,
      normalizedEmail
    );

    // If email fails to send, roll back user creation
    if (!emailResponse || emailResponse.error) {
      await users.deleteOne({ email: normalizedEmail });
      return res.status(500).json({ message: "Failed to send email" });
    }

    return res.status(200).json({
      message: "Sign up successful, awaiting email verification",
    });
  } catch (error) {
    captureEvent("User Signup Error", {
      properties: {
        error,
        email,
      },
    });

    return res.status(500).json({ message: "Internal server error" });
  }
}
