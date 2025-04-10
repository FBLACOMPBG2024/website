import { NextApiRequest, NextApiResponse } from "next";
import client from "@/lib/mongodb";
import api from "@/utils/api";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/utils/sessionConfig";
import argon2 from "argon2";
import { ObjectId } from "mongodb";
import { sendEmailVerification } from "@/utils/email";
import { generateLink } from "@/utils/generateLink";
import { captureEvent } from "@/utils/posthogHelper";

// Handles sign-up via Google OAuth and creates a user record if they don't exist.

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {
      const { access_token } = req.body;

      if (!access_token) {
        captureEvent("Google Sign-Up Error - Missing Token", {
          properties: { method: req.method },
        });

        return res.status(400).json({ message: "Access token is missing" });
      }

      const userInfo = await api
        .get("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${access_token}` },
        })
        .then((res) => res.data);

      const {
        email,
        given_name,
        family_name,
        picture,
        sub: googleId,
      } = userInfo;

      if (!email) {
        captureEvent("Google Sign-Up Error - No Email", {
          properties: { userInfo },
        });

        return res
          .status(400)
          .json({ message: "No email associated with this account" });
      }

      const existingUser = await client
        .db()
        .collection("users")
        .findOne({ email });

      if (existingUser) {
        captureEvent("Google Sign-Up Error - Email Exists", {
          properties: { email },
        });

        return res.status(400).json({ message: "Email already in use" });
      }

      // Generate a hashed password (not used directly but required for schema consistency)
      const hashedPassword = await argon2.hash(
        "google-" + googleId + Date.now()
      );

      const newUser = {
        email: email.toLowerCase(),
        password: hashedPassword,
        firstName: given_name,
        lastName: family_name,
        emailVerified: false,
        createdAt: new Date(),
        balance: 0,
        preferences: {
          theme: "system",
          accountId: "",
        },
      };

      const insertResult = await client
        .db()
        .collection("users")
        .insertOne(newUser);

      if (!insertResult.acknowledged) {
        captureEvent("Google Sign-Up Error - Insert Failed", {
          properties: { user: newUser },
        });

        return res
          .status(500)
          .json({ message: "Failed to create user in the database" });
      }

      // Send verification email
      const link = await generateLink(
        email.toLowerCase(),
        "email-verification"
      );
      const emailResponse = await sendEmailVerification(
        given_name,
        link,
        email.toLowerCase()
      );

      if (!emailResponse || emailResponse.error) {
        captureEvent("Google Sign-Up Email Error", {
          properties: { error: emailResponse?.error },
        });

        await client
          .db()
          .collection("users")
          .deleteOne({ email: email.toLowerCase() });

        return res
          .status(500)
          .json({ message: "Failed to send verification email" });
      }

      captureEvent("Google Sign-Up Success", {
        properties: {
          email: newUser.email,
          userId: insertResult.insertedId.toString(),
        },
      });

      res.status(200).json({
        message: "Sign up successful, awaiting email verification",
      });
    } catch (error: any) {
      captureEvent("Google Sign-Up Fatal Error", {
        properties: { error: error?.toString() },
      });

      return res.status(500).json({ message: "Authentication failed" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
