import { NextApiRequest, NextApiResponse } from "next";
import client from "@/lib/mongodb";
import api from "@/utils/api";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/utils/sessionConfig";
import { SessionData } from "@/utils/sessionData";
import { captureEvent } from "@/utils/posthogHelper";

// This file defines the API route that allows the user to log in with Google
// It uses the Google OAuth2 API to authenticate the user

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {
      const { access_token } = req.body;

      // Check if the access token is provided
      if (!access_token) {
        return res.status(400).json({ message: "Access token is missing" });
      }

      // Get the user's information from Google using the access token
      const userInfo = await api
        .get("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${access_token}` },
        })
        .then((response) => response.data);

      const { email } = userInfo;

      // Ensure the email exists in the userInfo object
      if (!email) {
        return res
          .status(400)
          .json({ message: "No email associated with this Google account" });
      }

      // Check if the user exists in the database
      let user = await client.db().collection("users").findOne({ email });

      if (!user) {
        return res.status(400).json({ message: "User account does not exist" });
      }

      // Create or update session
      const session = await getIronSession<SessionData>(
        req,
        res,
        sessionOptions
      );
      session.user = {
        _id: user._id.toString(),
        email,
      };
      await session.save();

      captureEvent("Google Login", {
        properties: {
          user,
        },
      });

      // Return the user's information upon successful login
      res.status(200).json({
        message: "Login successful",
        user: {
          id: user._id.toString(),
          email,
        },
      });
    } catch (error: any) {
      // Capture error event for debugging
      captureEvent("Google Login Error", {
        properties: {
          error,
        },
      });

      return res
        .status(500)
        .json({ message: "Authentication failed. Please try again." });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
