import { NextApiRequest, NextApiResponse } from "next";

import client from "@/lib/mongodb";
import { generateEmailLink } from "@/utils/generateEmailLink";
import { sendEmail } from "@/utils/sendEmail";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        // Get the email from the request body
        const { email } = req.body;

        if (!email) {
            res.status(400).json({ message: 'Email is required' });
            return;
        }

        // Check if the user exists
        const user = await client.db().collection("users").findOne({ email: email });
        if (!user) {
            res.status(400).json({ message: 'User not found' });
            return;
        }

        // Check if the user has already verified their email
        if (user.emailVerified) {
            res.status(400).json({ message: 'Email already verified' });
            return;
        }

        // Check if the users old links are less than 3 minutes old,
        // If they are, do not generate a new link
        const threeMinutesAgo = new Date(Date.now() - 1000 * 60 * 3);
        const links = await client.db().collection("links").find({ targetEmail: email, createdAt: { $gt: threeMinutesAgo } }).toArray();
        if (links.length > 0) {
            res.status(400).json({ message: 'Too many emails sent recently, Try again later.' });
            return;
        }

        // Generate a new link
        const link = await generateEmailLink(email);

        // Send the email
        const emailResponse = await sendEmail(user.firstName, link, email);

        if (!emailResponse) {
            res.status(500).json({ message: 'Failed to send email' });
            return;
        }

        res.status(200).json({ message: 'Email sent' });


    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}