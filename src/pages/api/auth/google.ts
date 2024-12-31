import { NextApiRequest, NextApiResponse } from "next";
import { OAuth2Client } from "google-auth-library";
import Cors from "cors";

// This file defines the API route that allows the user to get their profile information from Google
// It uses the Google OAuth2 API to get the user's information
// (See the other google api related stuff for an explanation of the cors )

// Initialize CORS middleware
const cors = Cors({
  methods: ["GET", "POST", "OPTIONS"],
  origin: "*", // You can specify your front-end URL here to restrict which origins are allowed
});

// Helper function to run CORS middleware
const runCors = (req: NextApiRequest, res: NextApiResponse) =>
  new Promise((resolve, reject) => {
    cors(req, res, (result: any) => {
      if (result instanceof Error) {
        reject(result);
      } else {
        resolve(result);
      }
    });
  });

// Initialize OAuth2Client with credentials
const oAuth2Client = new OAuth2Client(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  "postmessage", // This is the redirect URL
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // Run CORS middleware
  try {
    await runCors(req, res);
  } catch (error: any) {
    return res
      .status(500)
      .json({ message: "CORS Error", error: error.message });
  }

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
