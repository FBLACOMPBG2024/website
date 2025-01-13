import { NextApiRequest, NextApiResponse } from "next";
import LoginSchema from "@/schemas/loginSchema";
import client from "@/lib/mongodb";
import argon2 from "argon2";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/utils/sessionConfig";
import { SessionData } from "@/utils/sessionData";

// TOOD: Make this a utility function
async function createSession(
  user: any,
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getIronSession<SessionData>(req, res, sessionOptions);
  session.user = {
    _id: user._id.toString(),
    email: user.email,
  };
  await session.save();
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const inputData = req.body;

    // Parse login data using Zod
    const result = LoginSchema.safeParse(inputData);
    if (!result.success) {
      return res
        .status(400)
        .json({ message: "Invalid input data", error: result.error });
    }

    const { email, password } = inputData;

    try {
      // Get the user from the database
      const user = await client.db().collection("users").findOne({ email });

      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Account created via Google
      if (user.password === "GOOGLE" || user.password === undefined) {
        return res
          .status(401)
          .json({ message: "This account was created using Google" });
      }

      // Check password hash
      const isPasswordValid = await argon2.verify(user.password, password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Check email verification
      if (!user.emailVerified) {
        return res.status(401).json({ message: "Awaiting email verification" });
      }

      // Create session
      await createSession(user, req, res);

      // Return user info
      return res.status(200).json({
        message: "Login successful",
        user: {
          id: user._id,
          email: user.email,
        },
      });
    } catch (error: any) {
      console.error("Login error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
