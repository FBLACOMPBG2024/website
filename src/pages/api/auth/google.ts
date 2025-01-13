import { NextApiRequest, NextApiResponse } from "next";
import { OAuth2Client } from "google-auth-library";
import Cors from "cors";

// Initialize CORS middleware
const cors = Cors({
  methods: ["POST"],
  allowedHeaders: ["Content-Type", "Authorization"],
});

// Initialize OAuth2Client with credentials
const oAuth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "postmessage" // Redirect URL (should match the one in Google API Console)
);

// Helper function to run CORS middleware
function runMiddleware(req: NextApiRequest, res: NextApiResponse) {
  return new Promise((resolve, reject) => {
    cors(req, res, (result: any) => {
      if (result instanceof Error) {
        reject(result);
      }
      resolve(result);
    });
  });
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Run CORS middleware before processing
  await runMiddleware(req, res);

  if (req.method === "POST") {
    try {
      const { code } = req.body;

      // Check if the authorization code is provided
      if (!code) {
        return res
          .status(400)
          .json({ message: "Authorization code is missing" });
      }

      // Exchange code for tokens
      const { tokens } = await oAuth2Client.getToken(code);

      // Ensure the tokens are received
      if (!tokens || !tokens.access_token) {
        return res
          .status(400)
          .json({ message: "Failed to obtain access token" });
      }

      // Respond with the tokens
      res.status(200).json(tokens);
    } catch (error: any) {
      console.error("Google OAuth Error:", error);
      return res
        .status(400)
        .json({ message: "Invalid token", error: error.message });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
