import { NextApiRequest, NextApiResponse } from "next";
import client from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import cookie from "cookie";
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {

        const cookies = cookie.parse(req.headers.cookie || '');
        const token = cookies.token || '';

        if (!token) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        // Get the user from the database
        const user = await client.db().collection("users").findOne({ _id: new ObjectId(token) });

        if (!user) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        if (user.emailVerified) {

            res.setHeader(
                'Set-Cookie',
                cookie.serialize('token', user._id.toString(), {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    maxAge: 60 * 60 * 24 * 7, // 1 week
                    sameSite: 'strict',
                    path: '/',
                })
            );

            res.status(200).json({ message: 'Refresh successful', user: user });
        } else {
            res.status(401).json({ message: 'Unauthorized' });
        }


    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}