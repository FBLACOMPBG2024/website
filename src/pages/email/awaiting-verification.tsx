import Topbar from "@/components/ui/Topbar";
import Card from "@/components/ui/Card";
import { IconMail } from "@tabler/icons-react";
import { useRouter } from "next/router";
import { useState } from "react";
import api from "@/utils/api";

export default function Dashboard() {
    const router = useRouter();
    const email = router.query.email as string;

    const [message, setMessage] = useState("");
    // Couldn't think of a better name but it is used to check if the user has entered something wrong 
    const [isBad, setIsBad] = useState(false);

    const handleResendEmail = async () => {
        const response = await api.post("/api/auth/resend-email", {
            email: email,
        });


        if (response.status === 200) {
            setMessage("Email sent");
            setIsBad(false);
        } else {
            const res = await response.data;
            setMessage(res.message);
            setIsBad(true);
        }
    }

    return (
        <div className="flex flex-col h-screen w-screen">
            {/* Topbar */}
            <Topbar />
            {/* Gradient background that fills the remaining screen space */}
            <div className="flex-1 bg-gradient-to-bl from-background via-background to-backgroundGreen">
                <div className="h-full w-full flex justify-center items-center">
                    <div className="w-full h-full flex justify-center items-center">
                        <Card className="min-w-0.5 w-1/4 flex-col justify-center items-center m-10">
                            <h1 className="text-4xl font-bold p-2">
                                Email Verification
                            </h1>
                            <div className="flex-col justify-center items-center">
                                <IconMail className="w-full h-full" />
                                <p className="text-lg text-center">
                                    Please check your email for a verification link.
                                </p>
                                <p className="text-sm text-gray-500 text-center p-1">
                                    If you did not receive an email (Be sure to check your spam folder), you can request another one.
                                </p>

                                <p className={`text-sm ${isBad ? 'text-red-500' : 'text-text'}`}  >
                                    {message}
                                </p>
                                <button className="text-lg bg-primary p-2 rounded-md shadow-md w-full my-1" onClick={handleResendEmail}>
                                    Request another email
                                </button>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
