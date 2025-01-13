import { NextApiRequest, NextApiResponse } from "next";
import client from "@/lib/mongodb";
import api from "@/utils/api";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/utils/sessionConfig";
import argon2 from "argon2";
import { ObjectId } from "mongodb";
import { sendEmailVerification } from "@/utils/email";
import { generateLink } from "@/utils/generateLink";

// This file defines the API route that allows the user to log in with Google
// It uses the Google OAuth2 API to authenticate the user

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {
      const { access_token } = req.body;

      // Check if the access token is present
      if (!access_token) {
        return res.status(400).json({ message: "Access token is missing" });
      }

      // Get the user's information from Google
      const userInfo = await api
        .get("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${access_token}` },
        })
        .then((res) => res.data);

      console.log("Google user info:", userInfo);

      const {
        email,
        given_name,
        family_name,
        picture,
        sub: googleId,
      } = userInfo;

      // Ensure email exists in response
      if (!email) {
        return res
          .status(400)
          .json({ message: "No email associated with this account" });
      }

      // Check if the user already exists in the database
      let user = await client.db().collection("users").findOne({ email });

      if (user) {
        // Inform the user the email is already in use
        return res.status(400).json({ message: "Email already in use" });
      }

      // Create a new user if one does not exist
      const hashedPassword = await argon2.hash(
        "google-" + googleId + Date.now()
      ); // Adding timestamp for randomness

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

      // Insert the new user into the database
      const insertResult = await client
        .db()
        .collection("users")
        .insertOne(newUser);

      if (!insertResult.acknowledged) {
        return res
          .status(500)
          .json({ message: "Failed to create user in the database" });
      }

      // Generate and send the email verification link
      const link = await generateLink(
        email.toLowerCase(),
        "email-verification"
      );
      const emailResponse = await sendEmailVerification(
        given_name,
        link,
        email.toLowerCase()
      );

      // If sending the email failed, delete the user and return an error
      if (!emailResponse || emailResponse.error) {
        console.error(emailResponse?.error || "Email failed to send");

        // Clean up the user in case email verification fails
        await client
          .db()
          .collection("users")
          .deleteOne({ email: email.toLowerCase() });

        return res
          .status(500)
          .json({ message: "Failed to send verification email" });
      }

      // Return a success response
      res.status(200).json({
        message: "Sign up successful, awaiting email verification",
      });
    } catch (error: any) {
      console.error("Google login error:", error.message);

      // Log more detailed error information for debugging
      console.error("Stack trace:", error.stack);

      return res.status(500).json({ message: "Authentication failed" });
    }
  } else {
    // Handle unsupported HTTP methods
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
