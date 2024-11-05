import { NextApiRequest, NextApiResponse } from 'next';
import Cors from 'cors';
import api from '@/utils/api';

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

    if (req.method === 'GET') {
        const access_token = req.query.access_token;

        if (!access_token) {
            res.status(400).json({ message: "No access token" });
        }

        const userInfo = await api
            .get('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${access_token}` },
            })
            .then(res => res.data);

        res.json(userInfo);
    } else {
        res.setHeader('Allow', ['GET']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
