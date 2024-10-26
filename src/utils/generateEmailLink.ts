import crypto from "crypto";
import client from "@/lib/mongodb";
export async function generateEmailLink(email: string): Promise<string> {
    const token = crypto.randomBytes(32).toString('hex');

    // the URL the user will be sent
    const url = process.env.URL + "api/auth/email?" + new URLSearchParams({
        token: token
    });

    // Create email in database
    await client.db().collection("links").insertOne({
        targetEmail: email,
        token: token,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24 hours from now
        used: false, // Whether the link has been used/accessed
        usedAt: null, // When the link was used
    });


    return url;
}