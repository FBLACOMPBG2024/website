import { NextApiRequest, NextApiResponse } from "next";
import client from "@/lib/mongodb";
import SignInSchema from "@/schemas/signinSchema";
import argon2 from "argon2";


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { email, password } = SignInSchema.parse(req.body);

    // Get the user from the database
    const user = await client.db().collection("users").findOne({ email: email });

    if (!user) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    // Check argon2 hash
    const isPasswordValid = await argon2.verify(user.password, password);

    if (!isPasswordValid) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    res.status(200).json({ message: 'Sign in successful' });

  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}