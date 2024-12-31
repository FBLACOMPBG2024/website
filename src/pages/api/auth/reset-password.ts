import { NextApiRequest, NextApiResponse } from "next";
import client from "@/lib/mongodb";

// This endpoint is used to reset the user's password
// It sets the user's resetPassword flag to true
// and redirects the user to the password reset page

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === "GET") {
    const link = await client
      .db()
      .collection("links")
      .findOne({ token: req.query.token });

    // Ensure the link exists and is of the type "reset-password"
    if (!link || link.type !== "reset-password") {
      res.status(404).json({ message: "Invalid link" });
      return;
    }

    // Check if the link has expired
    if (link.expires < new Date()) {
      res.status(404).json({ message: "Link expired" });
      return;
    }

    if (link.used) {
      res.status(400).json({ message: "Link already used" });
      return;
    }

    // Set the user's flag to reset the password
    await client
      .db()
      .collection("users")
      .updateOne(
        { email: link.targetEmail },
        { $set: { resetPassword: true } },
      );

    // Update the link to be used
    await client
      .db()
      .collection("links")
      .updateOne(
        { token: req.query.token },
        { $set: { used: true, usedAt: new Date(Date.now()) } },
      );

    // Redirect the user to the reset password page
    res
      .status(200)
      .redirect(process.env.URL + "/password/set?token=" + req.query.token);
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
