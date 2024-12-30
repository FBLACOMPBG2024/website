import { NextApiRequest, NextApiResponse } from "next";
import client from "@/lib/mongodb";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        const link = await client.db().collection("links").findOne({ token: req.query.token });

        if (!link || link.type !== 'email-verification') {
            res.status(404).json({ message: 'Invalid link' });
            return;
        }

        if (link.expires < new Date()) {
            res.status(404).json({ message: 'Link expired' });
            return;
        }
        const user = await client.db().collection("users").updateOne({ email: link.targetEmail }, { $set: { emailVerified: true } });

        if (!user) {
            res.status(500).json({ message: 'User not found' });
            return;
        }

        await client.db().collection("links").updateOne({ token: req.query.token }, { $set: { used: true, usedAt: new Date(Date.now()) } });

        res.status(200).redirect(process.env.URL + '/email/verified');
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}