import { NextApiRequest, NextApiResponse } from "next";
import client from "@/lib/mongodb";

// This endpoint is used to reset the user's password
// It sets the user's resetPassword flag to true
// and redirects the user to the password reset page

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
        .findOne({ token: token });

      // Ensure the link exists and is of the type "reset-password"
      if (!link || link.type !== "reset-password") {
        console.log(`Invalid link: ${token}`);
        return res.status(404).json({ message: "Invalid link" });
      }

      // Check if the link has expired
      if (link.expires < new Date()) {
        console.log(`Link expired: ${token}`);
        return res.status(404).json({ message: "Link expired" });
      }

      // Check if the link has already been used
      if (link.used) {
        console.log(`Link already used: ${token}`);
        return res.status(400).json({ message: "Link already used" });
      }

      // Set the user's flag to reset the password
      await client
        .db()
        .collection("users")
        .updateOne(
          { email: link.targetEmail },
          { $set: { resetPassword: true } }
        );

      // Mark the link as used
      await client
        .db()
        .collection("links")
        .updateOne(
          { token: token },
          { $set: { used: true, usedAt: new Date(Date.now()) } }
        );

      // Redirect the user to the reset password page
      const resetPasswordUrl = new URL("/password/set", process.env.URL);
      resetPasswordUrl.searchParams.set("token", token as string);
      res.status(200).redirect(resetPasswordUrl.toString());
    } catch (error: any) {
      console.error("Error resetting password:", error.message);
      res.status(500).json({ message: "Internal server error" });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
