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
      // Get session
      const session = await getIronSession<SessionData>(
        req,
        res,
        sessionOptions
      );

      // Destroy the session
      session.destroy();

      // Optionally, you can redirect the user to the home page or a login page
      res.status(200).json({ message: "Signed out" });

      // If you want to redirect to another page after logging out, you can use:
      // res.redirect(302, '/login'); // Redirect to login page
    } catch (error) {
      console.error("Sign-out error:", error);
      res.status(500).json({ message: "Error signing out" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
