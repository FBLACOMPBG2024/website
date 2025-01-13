import { NextApiRequest, NextApiResponse } from "next";
import client from "@/lib/mongodb";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/utils/sessionConfig";
import { SessionData } from "@/utils/sessionData";
import { ObjectId } from "mongodb";
import { z } from "zod";
import GoalSchema from "@/schemas/goalSchema";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getIronSession<SessionData>(req, res, sessionOptions);

  // Ensure the user is authenticated
  if (!session.user?._id) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const userId = session.user._id;

  try {
    // Handle POST request for creating a goal
    if (req.method === "POST") {
      try {
        // Validate request body using Zod
        GoalSchema.parse(req.body);
      } catch (error: any) {
        // Return detailed validation errors if input is invalid
        if (error instanceof z.ZodError) {
          return res.status(400).json({
            message: "Validation failed",
            errors: error.errors, // Returning detailed validation errors
          });
        }
        return res.status(400).json({ message: "Invalid input" });
      }

      const { value, name, description = "", targetDate } = req.body;

      // Construct the goal object
      const goal = {
        _id: new ObjectId(),
        value,
        name,
        description, // Default to empty string if not provided
        targetDate: targetDate ? new Date(targetDate) : undefined,
      };

      // Update the user's document in the database by adding the goal
      const result = await client
        .db()
        .collection("users")
        .updateOne(
          { _id: new ObjectId(userId) },
          {
            $addToSet: { goals: goal },
          },
          { upsert: true } // Ensure document is created if it doesn't exist
        );

      // Handle result of the database operation
      if (result.modifiedCount > 0 || result.upsertedCount > 0) {
        return res.status(200).json({
          message: "Goal created successfully",
          goal, // Optionally return the created goal
        });
      }

      return res.status(500).json({
        message: "Failed to update the user's goals. Try again later.",
      });
    }

    // Handle unsupported methods
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({
      message: `Method ${req.method} Not Allowed`,
    });
  } catch (error) {
    // General error handler for unexpected errors
    console.error("Error creating goal:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export default handler;
