import { NextApiRequest, NextApiResponse } from "next";
import client from "@/lib/mongodb";
import api from "@/utils/api";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/utils/sessionConfig";
import { SessionData } from "@/utils/sessionData";
import { captureEvent } from "@/utils/posthogHelper";

// Handles user login via Google OAuth by verifying the access token,
// fetching user info from Google, and creating a session if the user exists.

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {
      const { access_token } = req.body;

      if (!access_token) {
        captureEvent("Login Error - Missing Token", {
          properties: {
            method: req.method,
            endpoint: "/api/login",
          },
        });

        return res.status(400).json({ message: "Access token is missing" });
      }

      captureEvent("Google Login Attempt", {
        properties: {
          endpoint: "/api/login",
        },
      });

      // Get user info from Google using the token
      const userInfo = await api
        .get("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${access_token}` },
        })
        .then((response) => response.data);

      const { email } = userInfo;

      if (!email) {
        captureEvent("Login Error - Missing Email in Google Info", {
          properties: {
            userInfo,
          },
        });

        return res
          .status(400)
          .json({ message: "No email associated with this Google account" });
      }

      const user = await client.db().collection("users").findOne({ email });

      if (!user) {
        captureEvent("Login Error - User Not Found", {
          properties: {
            email,
          },
        });

        return res.status(400).json({ message: "User account does not exist" });
      }

      // Set up session data
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

      captureEvent("Google Login Success", {
        properties: {
          email,
          userId: user._id.toString(),
        },
      });

      return res.status(200).json({
        message: "Login successful",
        user: {
          id: user._id.toString(),
          email,
        },
      });
    } catch (error: any) {
      captureEvent("Google Login Error", {
        properties: {
          error: error?.toString(),
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
