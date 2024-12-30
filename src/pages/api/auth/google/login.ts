import { NextApiRequest, NextApiResponse } from "next";
import client from "@/lib/mongodb";
import api from "@/utils/api";
import cookie from "cookie";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {
      const access_token = req.body.access_token;

      if (!access_token) {
        res.status(400).json({ message: "No access token" });
      }

      const userInfo = await api
        .get("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${access_token}` },
        })
        .then((res) => res.data);

      const email = userInfo.email;

      if (!email) {
        res.status(400).json({ message: "No email" });
      }

      // Check if the user exists
      const user = await client
        .db()
        .collection("users")
        .findOne({ email: email });
      if (!user) {
        res.status(400).json({ message: "User does not exist" });
      }

      res.setHeader(
        "Set-Cookie",
        cookie.serialize("token", user?._id.toString() || "", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          maxAge: 60 * 60 * 24 * 7, // 1 week
          sameSite: "strict",
          path: "/",
        })
      );

      res.status(200).json({ message: "Login successful", user: user });
    } catch (error) {
      console.error("Google sign-up error:", error);
      return res.status(500).json({ message: "Authentication failed" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
