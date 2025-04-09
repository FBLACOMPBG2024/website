import { NextApiRequest, NextApiResponse } from "next";
import { OAuth2Client } from "google-auth-library";
import { captureEvent } from "@/utils/posthogHelper";

// Initialize OAuth2Client with credentials
const oAuth2Client = new OAuth2Client(
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "postmessage" // Redirect URL (should match the one in Google API Console)
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
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

      // Track successful token exchange
      captureEvent("Google Token Exchange", {
        properties: {
          hasAccessToken: !!tokens.access_token,
          hasIdToken: !!tokens.id_token,
        },
      });

      // Respond with the tokens
      res.status(200).json(tokens);
    } catch (error: any) {
      captureEvent("Google OAuth Error", {
        properties: {
          error,
        },
      });

      return res
        .status(400)
        .json({ message: "Invalid token", error: error.message });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
