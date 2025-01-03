import crypto from "crypto";
import client from "@/lib/mongodb";
export async function generateLink(
  email: string,
  type: string,
): Promise<string> {
  // This function generates a link for the user to click on
  // Its purpose is to verify the user's email or reset their password
  // The link is stored in the database and is only valid for 24 hours
  // The link is generated with a random token
  // So the user cannot guess the link and access it
  const token = crypto.randomBytes(32).toString("hex");

  // the URL the user will be sent
  const url = `${process.env.URL}api/auth/${type}?${new URLSearchParams({
    token: token,
  })}`;

  // Create link in database
  await client
    .db()
    .collection("links")
    .insertOne({
      targetEmail: email.toLocaleLowerCase(),
      token: token,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24 hours from now
      used: false, // Whether the link has been used/accessed
      usedAt: null, // When the link was used
      type: type,
    });

  return url;
}
