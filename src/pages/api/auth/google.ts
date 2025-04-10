import { NextApiRequest, NextApiResponse } from "next";
import { OAuth2Client } from "google-auth-library";
import { captureEvent } from "@/utils/posthogHelper";

const oAuth2Client = new OAuth2Client(
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "postmessage"
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {
      const { code } = req.body;

      if (!code) {
        captureEvent("Google OAuth Error - Missing Code", {});
        return res
          .status(400)
          .json({ message: "Authorization code is missing" });
      }

      const { tokens } = await oAuth2Client.getToken(code);

      if (!tokens || !tokens.access_token) {
        captureEvent("Google OAuth Error - No Access Token", {
          properties: { tokens },
        });
        return res
          .status(400)
          .json({ message: "Failed to obtain access token" });
      }

      captureEvent("Google Token Exchange", {
        properties: {
          hasAccessToken: !!tokens.access_token,
          hasIdToken: !!tokens.id_token,
          hasRefreshToken: !!tokens.refresh_token,
        },
      });

      res.status(200).json(tokens);
    } catch (error: any) {
      captureEvent("Google OAuth Error - Exception", {
        properties: {
          error: error?.message || error,
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
