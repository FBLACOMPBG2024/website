import { NextApiRequest, NextApiResponse } from "next";

import client from "@/lib/mongodb";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {

    // Get the user from the database
    const user = await client.db().collection("users").findOne({ email: req.body.email });

    if (!user) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    // Check if the password is correct
    if (user.password !== req.body.password) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    res.status(200).json({ message: 'Sign in successful' });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}