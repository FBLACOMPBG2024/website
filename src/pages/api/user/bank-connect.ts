import { NextApiRequest, NextApiResponse } from "next";
import client from "@/lib/mongodb";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/utils/sessionConfig";
import { SessionData } from "@/utils/sessionData";
import { ObjectId } from "mongodb";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getIronSession<SessionData>(req, res, sessionOptions);

  // Ensure the user is authenticated
  if (!session.user?._id) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const userId = session.user._id;

  try {
    // Handle POST request to save bank account connection
    if (req.method === "POST") {
      const { accessToken } = req.body;

      // Validate input
      if (!accessToken) {
        return res.status(400).json({ message: "Access token is required" });
      }

      // Save the accessToken to the user's record in the database
      await client
        .db()
        .collection("users")
        .updateOne(
          { _id: new ObjectId(userId) },
          {
            $set: { bankAccessToken: accessToken },
          }
        );

      return res
        .status(200)
        .json({ message: "Bank account connected successfully" });
    }

    // Handle unsupported methods
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error("Error connecting bank account:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export default handler;
