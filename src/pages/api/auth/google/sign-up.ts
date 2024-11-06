import { NextApiRequest, NextApiResponse } from 'next';
import client from "@/lib/mongodb";
import api from "@/utils/api";
import { generateEmailLink } from "@/utils/generateEmailLink";
import { sendEmail } from "@/utils/sendEmail";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method === 'POST') {

        try {
            const access_token = req.body.access_token;

            if (!access_token) {
                res.status(400).json({ message: "No access token" });
            }

            const userInfo = await api
                .get('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: { Authorization: `Bearer ${access_token}` },
                })
                .then(res => res.data);

            if (!userInfo.email) {
                res.status(400).json({ message: "No email" });
            }

            const email = userInfo.email;
            const firstName = userInfo.given_name;
            const lastName = userInfo.family_name;

            // Check if the email is already in use
            const user = await client.db().collection("users").findOne({ email: email });
            if (user) {
                res.status(400).json({ message: 'Email already in use' });
                return;
            }

            // Create the user in the database
            await client.db().collection("users").insertOne({
                email: email,
                password: "GOOGLE",
                firstName: firstName,
                lastName: lastName,
                emailVerified: false,
                createdAt: new Date(),
                balance: 0,
                googleId: userInfo.sub,
            });

            // Make sure all other links are older than 3 minutes
            // This is to prevent users from spamming the email verification link

            // If there are any links that are less than 3 minutes old, do not generate a new link
            const threeMinutesAgo = new Date(Date.now() - 1000 * 60 * 3);
            const links = await client.db().collection("links").find({ targetEmail: email, createdAt: { $gt: threeMinutesAgo } }).toArray();
            if (links.length > 0) {
                res.status(400).json({ message: 'Too many links generated recently, Try again later.' });
                return;
            }

            const link = await generateEmailLink(email);
            const emailResponse = await sendEmail(firstName, link, email);

            if (!emailResponse) {
                res.status(500).json({ message: 'Failed to send email' });
                return;
            }

            if (emailResponse.error) {
                console.error(emailResponse.error);
                res.status(500).json({ message: 'Failed to send email' });

                // Delete the user from the database
                await client.db().collection("users").deleteOne({ email: email });

                return;
            }

            res.status(200).json({ message: 'Sign up successful, awaiting email verification' });

        } catch (error) {
            console.error('Google sign-up error:', error);
            return res.status(500).json({ message: 'Authentication failed' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}