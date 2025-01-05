import { NextApiRequest, NextApiResponse } from "next";
import { OAuth2Client } from "google-auth-library";
import Cors from "cors";

// This file defines the API route that allows the user to get their profile information from Google
// It uses the Google OAuth2 API to get the user's information
// (See the other google api related stuff for an explanation of the cors )

// Initialize OAuth2Client with credentials
const oAuth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "postmessage", // This is the redirect URL
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === "POST") {
    try {
      const { tokens } = await oAuth2Client.getToken(req.body.code); // exchange code for tokens
      res.json(tokens);
    } catch (error: any) {
      return res
        .status(400)
        .json({ message: "Invalid token", error: error.message });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
