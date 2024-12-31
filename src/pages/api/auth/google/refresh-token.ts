import { UserRefreshClient } from "google-auth-library";
import { NextApiRequest, NextApiResponse } from "next";

// This file defines the API route that allows the user to refresh their access token
// It uses the Google OAuth2 API to refresh the user's access token

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === "POST") {
    // Check if the refresh token is present
    if (!req.body.refresh_token) {
      return res.status(400).json({ message: "No refresh token" });
    }

    try {
      // Create a new user client with the refresh token
      const user = new UserRefreshClient(
        process.env.CLIENT_ID,
        process.env.CLIENT_SECRET,
        req.body.refresh_token,
      );

      // TODO: Actually catch the specific error instead of assuming it's invalid credentials
      const { credentials } = await user.refreshAccessToken();
      res.json(credentials);
    } catch (error: unknown) {
      console.error(error);
      return res.status(400).json({ message: "Invalid Credentials" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
