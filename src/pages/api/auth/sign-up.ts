import { NextApiRequest, NextApiResponse } from "next";
import SignUpSchema from "@/schemas/signupSchema";
import client from "@/lib/mongodb";
import argon2 from "argon2";
import { generateEmailLink } from "@/utils/generateEmailLink";
import { sendEmail } from "@/utils/sendEmail";
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        // Get information from the request
        const { firstName, lastName, email, password } = req.body;

        // Validate the input data
        const result = SignUpSchema.safeParse(req.body);
        if (!result.success) {
            res.status(400).json({ message: 'Invalid input data', error: result.error });
            return;
        }

        // Check if the email is already in use
        const user = await client.db().collection("users").findOne({ email: email });
        if (user) {
            res.status(400).json({ message: 'Email already in use' });
            return;
        }

        // Create the user in the database
        await client.db().collection("users").insertOne({
            email: email,
            password: await argon2.hash(password),
            firstName: firstName,
            lastName: lastName,
            emailVerified: false,
            createdAt: new Date(),
            balance: 0,
        });

        res.status(200).json({ message: 'Sign up successful, awaiting email verification' });

    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}