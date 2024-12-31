import { NextApiRequest, NextApiResponse } from "next";
import { generateLink } from "@/utils/generateLink";
import { sendEmailVerification } from "@/utils/email";
import client from "@/lib/mongodb";
import api from "@/utils/api";

// This file defines the API route that allows the user to sign up with Google
// It uses the Google OAuth2 API to authenticate the user
// It also sends an email verification link to the user
// And creates a user in the database

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === "POST") {
    try {
      // Get the access token from the request body
      const access_token = req.body.access_token;

      // Check if the access token is present
      if (!access_token) {
        res.status(400).json({ message: "No access token" });
      }

      // Get the user's information from Google
      const userInfo = await api
        .get("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${access_token}` },
        })
        .then((res) => res.data);

      // Get the user's email
      if (!userInfo.email) {
        res.status(400).json({ message: "No email" });
      }

      const email = userInfo.email.toLower(); // This tolower is very important to prevent duplicate emails
      // (I didn't think of this until after I wrote the whole sign up flow
      // and discovered that I could create multiple accounts with the same email)
      const firstName = userInfo.given_name; // Google doesn't provide a "first name", so we use the given name
      const lastName = userInfo.family_name; // Google doesn't provide a "last name", so we use the family name

      // Check if the email is already in use
      const user = await client
        .db()
        .collection("users")
        .findOne({ email: email });
      if (user) {
        res.status(400).json({ message: "Email already in use" });
        return;
      }

      // Create the user in the database
      await client.db().collection("users").insertOne({
        email: email,
        password: "GOOGLE", // This is a placeholder password, it will never be used (Because of argon2 even if the user tries to log in with this password it will not work)
        firstName: firstName,
        lastName: lastName,
        emailVerified: false, // The email is not verified yet
        createdAt: new Date(),
        balance: 0,
        googleId: userInfo.sub, // The user's Google ID
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

      const link = await generateLink(email, "email-verification");
      const emailResponse = await sendEmailVerification(firstName, link, email);

      if (!emailResponse) {
        res.status(500).json({ message: "Failed to send email" });
        return;
      }

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
    } catch (error) {
      console.error("Google sign-up error:", error);
      return res.status(500).json({ message: "Authentication failed" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
