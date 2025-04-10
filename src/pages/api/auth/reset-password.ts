import { NextApiRequest, NextApiResponse } from "next";
import client from "@/lib/mongodb";
import { captureEvent } from "@/utils/posthogHelper";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    const { token } = req.query;

    try {
      const link = await client
        .db()
        .collection("links")
        .findOne({ token });

      if (!link || link.type !== "reset-password") {
        captureEvent("Invalid Password Reset Link", {
          properties: {
            reason: "Invalid link or incorrect type",
            token,
          },
        });
        return res.status(404).json({ message: "Invalid link" });
      }

      if (link.expires < new Date()) {
        captureEvent("Expired Password Reset Link", {
          properties: {
            token,
            expiredAt: link.expires,
          },
        });
        return res.status(404).json({ message: "Link expired" });
      }

      if (link.used) {
        captureEvent("Used Password Reset Link", {
          properties: {
            token,
            usedAt: link.usedAt,
          },
        });
        return res.status(400).json({ message: "Link already used" });
      }

      await client
        .db()
        .collection("users")
        .updateOne(
          { email: link.targetEmail },
          { $set: { resetPassword: true } }
        );

      await client
        .db()
        .collection("links")
        .updateOne(
          { token },
          { $set: { used: true, usedAt: new Date() } }
        );

      const resetPasswordUrl = new URL("/password/set", process.env.URL);
      resetPasswordUrl.searchParams.set("token", token as string);
      res.status(200).redirect(resetPasswordUrl.toString());
    } catch (error: any) {
      captureEvent("Password Reset Error", {
        properties: {
          error,
          token,
        },
      });
      res.status(500).json({ message: "Internal server error" });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
