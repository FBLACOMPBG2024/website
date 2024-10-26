import { EmailTemplate } from '@/components/ui/EmailTemplate';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);


export async function sendEmail(name: string, link: string, email: string) {
    const { data, error } = await resend.emails.send({
        from: 'SmartSpend <noreply@quit-selling-my-info.online>',
        to: [email],
        subject: 'Welcome to SmartSpend!',
        react: EmailTemplate({ name: name, link: link }),
        text: 'Welcome to SmartSpend! Click the link to verify your email. ' + link,
    });

    return { data, error };
}