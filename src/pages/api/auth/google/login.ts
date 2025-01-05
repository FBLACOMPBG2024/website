import { NextApiRequest, NextApiResponse } from "next";
import client from "@/lib/mongodb";
import api from "@/utils/api";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/utils/sessionConfig";

// This file defines the API route that allows the user to log in with Google
// It uses the Google OAuth2 API to authenticate the user

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
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

      const { email } = userInfo;

      // Ensure email exists in response
      if (!email) {
        return res
          .status(400)
          .json({ message: "No email associated with this account" });
      }

      // Check if the user exists in the database
      let user = await client.db().collection("users").findOne({ email });

      if (!user) {
        // If the user doesn't exist, return an error or optionally create a new user
        return res.status(400).json({ message: "User does not exist" });
      }

      // Create or update session
      const session = await getIronSession(req, res, sessionOptions);
      session.user = {
        _id: user._id.toString(),
        email,
      };
      await session.save();

      // Return the user's information
      res.status(200).json({
        message: "Login successful",
        user: {
          id: user._id,
          email,
        },
      });
    } catch (error: any) {
      console.error("Google login error:", error.message);
      return res.status(500).json({ message: "Authentication failed" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
