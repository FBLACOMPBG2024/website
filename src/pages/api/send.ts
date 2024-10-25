import type { NextApiRequest, NextApiResponse } from 'next';
import { EmailTemplate } from '@/components/email-template';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async (req: NextApiRequest, res: NextApiResponse) => {
    const { data, error } = await resend.emails.send({
        from: 'SmartSpend <onboarding@resend.dev>',
        to: ['resend.cartload803@passinbox.com'],
        subject: 'Welcome to SmartSpend!',
        react: EmailTemplate({ name: 'John' }),
    });

    if (error) {
        console.error(error);
        return res.status(400).json(error);
    }

    res.status(200).json(data);
};
