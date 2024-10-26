import * as React from 'react';

interface EmailTemplateProps {
    name: string;
    link: string;
}

export const EmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
    name,
    link
}) => (
    <div>
        <h1>Welcome, {name}!</h1>
        <p>Please click the link below to verify your email:</p>
        <a href={link}>Verify Email</a>
    </div>
);
