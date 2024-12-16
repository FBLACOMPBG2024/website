import { NextApiRequest, NextApiResponse } from "next";
import { UserRefreshClient } from "google-auth-library";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    if (!req.body.refresh_token) {
      return res.status(400).json({ message: "No refresh token" });
    }

    try {
      const user = new UserRefreshClient(
        process.env.CLIENT_ID,
        process.env.CLIENT_SECRET,
        req.body.refresh_token
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
