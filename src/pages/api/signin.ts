import { NextApiRequest, NextApiResponse } from "next";
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI; // Ensure you have your MongoDB URI in your environment variables
const client = new MongoClient(uri);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { email, password } = req.body;

    try {
      await client.connect();
      const database = client.db('SmartSpend'); // Use your database name
      const usersCollection = database.collection('users'); // Use your users collection name

      // Find the user by email
      const user = await usersCollection.findOne({ email });

      console.log(user);

      // Check if user exists and password matches
      if (user && user.password === password) {
        // Return user object (excluding password)
        const { password, ...userWithoutPassword } = user;
        res.status(200).json(userWithoutPassword);
      } else {
        res.status(401).json({ message: 'Invalid email or password' });
      }
    } catch (error) {
      console.error('Error connecting to the database or fetching user:', error);
      res.status(500).json({ message: 'Internal server error' });
    } finally {
      await client.close();
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}