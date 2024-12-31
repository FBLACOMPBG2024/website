import { NextApiRequest, NextApiResponse } from "next";
import client from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import cookie from "cookie";

// This endpoint is used to update the user's information
// It is used to update the user's first name, last name, and email
// It will only update the fields that are provided in the request body

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === "POST") {
    const cookies = cookie.parse(req.headers.cookie || "");
    const token = cookies.token || "";

    if (!token) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // Get the user from the database
    const user = await client
      .db()
      .collection("users")
      .findOne({ _id: new ObjectId(token) });

    if (!user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // Get the request body and see what we need to update
    const { firstName, lastName, email } = req.body;

    // Update the user in the database but if one of the fields is missing, don't update it
    await client
      .db()
      .collection("users")
      .updateOne(
        { _id: user._id },
        {
          $set: {
            ...(firstName && { firstName }),
            ...(lastName && { lastName }),
            ...(email && { email }),
          },
        },
      );

    res.status(200).json({ message: "User updated" });
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
