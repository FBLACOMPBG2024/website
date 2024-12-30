
import { Html, Head, Body, Tailwind } from "@react-email/components";
interface ResetPasswordEmailTemplateProps {
    name: string;
    link: string;
}

export const ResetPasswordEmailTemplate: React.FC<Readonly<ResetPasswordEmailTemplateProps>> = ({
    name,
    link
}) => (
    <Html lang="en">
        <Tailwind config={{
            theme: {
                extend: {
                    colors: {
                        background: "rgba(16, 16, 16, 1)",
                        backgroundGray: "rgba(23, 23, 23, 1)",
                        backgroundGrayLight: "rgba(38, 38, 38, 1)",
                        backgroundGreen: "rgba(6, 19, 13, 1)",
                        text: "rgba(255, 255, 255, 1)",
                        primary: "rgba(49, 216, 138, 1)",
                        secondary: "rgba(0, 36, 19, 1)",
                        accent: "rgba(0, 194, 103, 1)",
                    },
                }
            }
        }}>
            <Head>
                <title>Reset Password</title>
            </Head>
            <Body>
                <div className="flex justify-center items-center h-screen">
                    <div className="bg-backgroundGray p-6 rounded-lg shadow-lg w-1/2">
                        <h1 className="text-text text-4xl font-bold mb-4">Hello, {name}</h1>
                        <p className="text-text text-lg mb-4">Please click the link below to reset your password:</p>
                        <a href={link} className="text-primary text-lg underline">Reset Password</a>
                    </div>
                </div>
            </Body>
        </Tailwind>
    </Html>
);
