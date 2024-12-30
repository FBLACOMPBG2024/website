import { EmailVerifyTemplate } from '@/components/ui/EmailVerifyTemplate';
import { ResetPasswordEmailTemplate } from '@/components/ui/ResetPasswordEmailTemplate';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);


export async function sendEmailVerification(name: string, link: string, email: string) {
    const { data, error } = await resend.emails.send({
        from: 'SmartSpend <noreply@quit-selling-my-info.online>',
        to: [email],
        subject: 'Welcome to SmartSpend!',
        react: EmailVerifyTemplate({ name: name, link: link }),
        text: 'Welcome to SmartSpend! Click the link to verify your email. ' + link,
    });

    return { data, error };
}

export async function sendPasswordReset(name: string, link: string, email: string) {
    const { data, error } = await resend.emails.send({
        from: 'SmartSpend <noreply@quit-selling-my-info.online>',
        to: [email],
        subject: 'Welcome to SmartSpend!',
        react: ResetPasswordEmailTemplate({ name: name, link: link }),
        text: 'Click the link here to reset your password: ' + link,
    });

    return { data, error };
}