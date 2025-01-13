import { UserRefreshClient } from "google-auth-library";
import { NextApiRequest, NextApiResponse } from "next";

// This file defines the API route that allows the user to refresh their access token
// It uses the Google OAuth2 API to refresh the user's access token

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { refresh_token } = req.body;

    // Check if the refresh token is provided
    if (!refresh_token) {
      return res.status(400).json({ message: "No refresh token provided" });
    }

    try {
      // Ensure client ID and secret are available in the environment variables
      const clientId = process.env.CLIENT_ID;
      const clientSecret = process.env.CLIENT_SECRET;

      if (!clientId || !clientSecret) {
        return res
          .status(500)
          .json({ message: "Client credentials are missing" });
      }

      // Create a new user client with the refresh token
      const user = new UserRefreshClient(clientId, clientSecret, refresh_token);

      // Attempt to refresh the access token
      const { credentials } = await user.refreshAccessToken();

      // Return the new credentials (access token)
      res.json(credentials);
    } catch (error: any) {
      console.error("Error refreshing access token:", error);

      // Handle specific error types based on error response from Google
      if (error.code === 400) {
        return res
          .status(400)
          .json({ message: "Invalid or expired refresh token" });
      }

      return res
        .status(500)
        .json({ message: "Internal Server Error: Unable to refresh token" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
