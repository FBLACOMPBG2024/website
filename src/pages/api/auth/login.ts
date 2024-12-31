import { NextApiRequest, NextApiResponse } from "next";
import LoginSchema from "@/schemas/loginSchema";
import client from "@/lib/mongodb";
import argon2 from "argon2";
import cookie from "cookie";

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

    // Set the user's token in a cookie
    res.setHeader(
      "Set-Cookie",
      cookie.serialize("token", user._id.toString(), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7, // 1 week
        sameSite: "strict",
        path: "/",
      }),
    );

    // Return the user's information
    res.status(200).json({ message: "Login successful", user: user });
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
