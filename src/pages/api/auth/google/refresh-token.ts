import { NextApiRequest, NextApiResponse } from 'next';
import { UserRefreshClient } from 'google-auth-library';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        if (!req.body.refreshToken) {
            return res.status(400).json({ message: "No refresh token" });
        }

        const user = new UserRefreshClient(
            process.env.CLIENT_ID,
            process.env.CLIENT_SECRET,
            req.body.refreshToken,
        );

        const { credentials } = await user.refreshAccessToken();
        res.json(credentials);
    } else {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
