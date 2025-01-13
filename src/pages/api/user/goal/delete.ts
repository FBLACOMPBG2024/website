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
    if (req.method === "DELETE") {
      const { goalId } = req.body;

      // Validate the goalId
      if (!goalId) {
        return res.status(400).json({ message: "Goal ID is required" });
      }

      // Check if the goalId is a valid ObjectId
      let parsedGoalId;
      try {
        parsedGoalId = new ObjectId(goalId);
      } catch (error) {
        return res.status(400).json({ message: "Invalid Goal ID format" });
      }

      // Remove the goal from the user's document in the database
      const result = await client
        .db()
        .collection("users")
        .updateOne(
          { _id: new ObjectId(userId) },
          {
            $set: {
              goals: {
                $filter: {
                  input: "$goals",
                  as: "goal",
                  cond: { $ne: ["$$goal._id", parsedGoalId] },
                },
              },
            },
          }
        );

      if (result.modifiedCount > 0) {
        return res.status(200).json({ message: "Goal deleted successfully" });
      }

      return res.status(404).json({ message: "Goal not found" });
    }

    // Handle unsupported methods
    res.setHeader("Allow", ["DELETE"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error("Error deleting goal:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export default handler;
