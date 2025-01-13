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
    if (req.method === "GET") {
      // Fetch the user from the database
      const user = await client
        .db()
        .collection("users")
        .findOne({
          _id: new ObjectId(userId),
        });

      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Return empty goals array if no goals exist
      if (!user.goals) {
        return res.status(200).json({ goals: [] });
      }

      // Return the user's goals
      return res.status(200).json({ goals: user.goals });
    }

    // Handle unsupported methods
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error("Error fetching user goals:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export default handler;
