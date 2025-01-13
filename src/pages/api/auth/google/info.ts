import { NextApiRequest, NextApiResponse } from "next";
import api from "@/utils/api";

// This file defines the API route that allows the user to get their profile information from Google
// It uses the Google OAuth2 API to get the user's information

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    const access_token = req.query.access_token as string;

    // Check if the access token is present
    if (!access_token) {
      return res.status(400).json({ message: "No access token provided" });
    }

    try {
      // Get the user's information from Google
      const userInfo = await api
        .get("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${access_token}` },
        })
        .then((response) => response.data);

      // Return the user's information
      return res.status(200).json(userInfo);
    } catch (error: any) {
      // Log the error and return an error message
      console.error("Error fetching user info from Google:", error);
      return res
        .status(500)
        .json({ message: "Unable to fetch user information" });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
