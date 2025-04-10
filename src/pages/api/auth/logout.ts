import { NextApiRequest, NextApiResponse } from "next";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/utils/sessionConfig";
import { SessionData } from "@/utils/sessionData";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {
      const session = await getIronSession<SessionData>(
        req,
        res,
        sessionOptions
      );
      session.destroy();
      res.status(200).json({ message: "Signed out" });
    } catch (error) {
      console.error("Sign-out error:", error);
      res.status(500).json({ message: "Error signing out" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
