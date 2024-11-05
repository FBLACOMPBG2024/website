import { NextApiRequest, NextApiResponse } from 'next';
import Cors from 'cors';
import { UserRefreshClient } from 'google-auth-library';

// Initialize CORS middleware
const cors = Cors({
    methods: ['GET', 'POST', 'OPTIONS'],
    origin: '*', // You can specify your front-end URL here to restrict which origins are allowed
});

// Helper function to run CORS middleware
const runCors = (req: NextApiRequest, res: NextApiResponse) =>
    new Promise((resolve, reject) => {
        cors(req, res, (result: any) => {
            if (result instanceof Error) {
                reject(result);
            } else {
                resolve(result);
            }
        });
    });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Run CORS middleware
    try {
        await runCors(req, res);
    } catch (error: any) {
        return res.status(500).json({ message: 'CORS Error', error: error.message });
    }

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
