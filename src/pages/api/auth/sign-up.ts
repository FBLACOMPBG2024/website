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
  res: NextApiResponse
) {
  if (req.method === "POST") {
    // Get user details from request body
    const { firstName, lastName, email, password } = req.body;

    // Validate the input data
    const result = SignUpSchema.safeParse(req.body);
    if (!result.success) {
      return res
        .status(400)
        .json({ message: "Invalid input data", error: result.error });
    }

    const normalizedEmail = email.toString().toLowerCase();

    try {
      // Check if the email already exists in the database
      const existingUser = await client
        .db()
        .collection("users")
        .findOne({ email: normalizedEmail });
      if (existingUser) {
        return res.status(400).json({ message: "Email already in use" });
      }

      // Hash the password
      const hashedPassword = await argon2.hash(password);

      // Create the user in the database
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

      // Start a database transaction (if needed for better consistency)
      const session = client.startSession();
      session.startTransaction();

      // Insert the user into the database
      const userInsertResult = await client
        .db()
        .collection("users")
        .insertOne(newUser, { session });

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
        await session.abortTransaction(); // Rollback if too many links generated
        return res.status(400).json({
          message: "Too many links generated recently, try again later.",
        });
      }

      // Generate the verification link
      const link = await generateLink(normalizedEmail, "email-verification");

      // Send the verification email
      const emailResponse = await sendEmailVerification(
        firstName,
        link,
        normalizedEmail
      );

      // If sending the email failed, roll back the user insertion
      if (!emailResponse || emailResponse.error) {
        console.error(
          "Email failed to send:",
          emailResponse?.error || "Unknown"
        );
        await client
          .db()
          .collection("users")
          .deleteOne({ email: normalizedEmail }, { session });
        await session.commitTransaction(); // Commit rollback
        return res.status(500).json({ message: "Failed to send email" });
      }

      // Commit the transaction
      await session.commitTransaction();

      res
        .status(200)
        .json({ message: "Sign up successful, awaiting email verification" });
    } catch (error) {
      console.error("Error during signup:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
