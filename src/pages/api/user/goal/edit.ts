import { NextApiRequest, NextApiResponse } from "next";
import client from "@/lib/mongodb";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/utils/sessionConfig";
import { SessionData } from "@/utils/sessionData";
import { ObjectId } from "mongodb";
import { z } from "zod";

// Input validation schema
const goalUpdateSchema = z.object({
  goalId: z.string().min(1, "Goal ID is required"),
  value: z.number().optional(),
  name: z.string().optional(),
  description: z.string().optional(),
  targetDate: z.string().optional(), // Expecting a string, we will parse it to Date
});

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getIronSession<SessionData>(req, res, sessionOptions);

  // Ensure the user is authenticated
  if (!session.user?._id) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const userId = session.user._id;

  try {
    if (req.method === "PUT") {
      // Validate the input with zod
      const parsed = goalUpdateSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.errors[0] });
      }

      const { goalId, value, name, description, targetDate } = parsed.data;

      const updateFields: { [key: string]: any } = {};

      // Prepare fields to update
      if (value !== undefined) updateFields["goals.$.value"] = value;
      if (name !== undefined) updateFields["goals.$.name"] = name;
      if (description !== undefined)
        updateFields["goals.$.description"] = description;

      if (targetDate !== undefined) {
        const parsedDate = new Date(targetDate);
        // Ensure the date is valid
        if (isNaN(parsedDate.getTime())) {
          return res.status(400).json({ message: "Invalid target date" });
        }
        updateFields["goals.$.targetDate"] = parsedDate;
      }

      // Update the goal in the database
      const result = await client
        .db()
        .collection("users")
        .updateOne(
          { _id: new ObjectId(userId), "goals._id": new ObjectId(goalId) },
          { $set: updateFields }
        );

      if (result.modifiedCount > 0 || result.upsertedCount > 0) {
        return res.status(200).json({ message: "Goal updated successfully" });
      }

      return res
        .status(404)
        .json({ message: "Goal not found or no changes made" });
    }

    // Handle unsupported methods
    res.setHeader("Allow", ["PUT"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error("Error updating goal:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export default handler;
