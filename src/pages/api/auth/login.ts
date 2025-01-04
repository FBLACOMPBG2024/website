import { NextApiRequest, NextApiResponse } from "next";
import LoginSchema from "@/schemas/loginSchema";
import client from "@/lib/mongodb";
import argon2 from "argon2";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/utils/sessionConfig";

// This file defines the API route that allows the user to log in

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === "POST") {
    const inputData = req.body;

    const result = LoginSchema.safeParse(inputData);
    // Parse login data with zod to ensure its all correct for us
    if (!result.success) {
      res
        .status(400)
        .json({ message: "Invalid input data", error: result.error });
      return;
    }

    const { email, password } = inputData;

    // Get the user from the database
    const user = await client
      .db()
      .collection("users")
      .findOne({ email: email });

    if (!user) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    if (user.password === undefined || user.password === "GOOGLE") {
      res.status(401).json({ message: "This account was created using google" });
      return;
    }

    // Check argon2 hash
    const isPasswordValid = await argon2.verify(user.password, password);

    if (!isPasswordValid) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    // Check if the user has verified their email
    if (!user.emailVerified) {
      res.status(401).json({ message: "Awaiting email verification" });
      return;
    }

    // Initialize the session
    const session = await getIronSession(req, res, sessionOptions);

    // Set session data
    session.user = {
      _id: user._id.toString(),
      email: user.email,
    };

    await session.save();

    // Return the user's information
    res.status(200).json({ message: "Login successful", user: user });
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
