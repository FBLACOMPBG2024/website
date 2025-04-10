import { NextApiRequest, NextApiResponse } from "next";
import api from "@/utils/api";
import { captureEvent } from "@/utils/posthogHelper";

// API route to fetch the user's profile info from Google using their OAuth access token

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    const access_token = req.query.access_token as string;

    // Check for missing token
    if (!access_token) {
      captureEvent("Missing Google Access Token", {
        properties: {
          method: req.method,
          endpoint: "/api/userinfo",
        },
      });

      return res.status(400).json({ message: "No access token provided" });
    }

    captureEvent("Google User Info Fetch Started", {
      properties: {
        method: req.method,
        endpoint: "/api/userinfo",
      },
    });

    try {
      // Request user info from Google API
      const userInfo = await api
        .get("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${access_token}` },
        })
        .then((response) => response.data);

      captureEvent("Google User Info Fetched", {
        properties: {
          email: userInfo?.email,
          sub: userInfo?.sub,
        },
      });

      return res.status(200).json(userInfo);
    } catch (error: any) {
      captureEvent("Google User Info Error", {
        properties: {
          error: error?.toString(),
        },
      });

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
