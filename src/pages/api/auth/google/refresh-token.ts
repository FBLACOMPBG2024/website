import { captureEvent } from "@/utils/posthogHelper";
import { UserRefreshClient } from "google-auth-library";
import { NextApiRequest, NextApiResponse } from "next";

// API route to refresh a Google access token using a refresh token.

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      captureEvent("Refresh Token Error - Missing Token", {
        properties: {
          method: req.method,
          endpoint: "/api/refresh-token",
        },
      });

      return res.status(400).json({ message: "No refresh token provided" });
    }

    try {
      const clientId = process.env.CLIENT_ID;
      const clientSecret = process.env.CLIENT_SECRET;

      if (!clientId || !clientSecret) {
        captureEvent("Refresh Token Error - Missing Client Credentials", {
          properties: {
            hasClientId: !!clientId,
            hasClientSecret: !!clientSecret,
          },
        });

        return res
          .status(500)
          .json({ message: "Client credentials are missing" });
      }

      const user = new UserRefreshClient(clientId, clientSecret, refresh_token);
      const { credentials } = await user.refreshAccessToken();

      captureEvent("Google Refresh Token Success", {
        properties: {
          clientId,
        },
      });

      return res.json(credentials);
    } catch (error: any) {
      captureEvent("Google Refresh Token Error", {
        properties: {
          error: error?.toString(),
        },
      });

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
