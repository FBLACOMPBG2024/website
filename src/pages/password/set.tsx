import Topbar from "@/components/ui/Topbar";
import Card from "@/components/ui/Card";
import { useRouter } from "next/router";
import { useState } from "react";
import api from "@/utils/api";
import TextInput from "@/components/ui/TextInput";

export default function Update() {
    const router = useRouter();

    // Add the password 
    const [password, setPassword] = useState("");

    const [message, setMessage] = useState("");
    // Couldn't think of a better name but it is used to check if the user has entered something wrong 
    const [isBad, setIsBad] = useState(false);

    // Add the handleResendEmail function
    const handlePasswordSet = async () => {
        if (!password) {
            setMessage("Password is required");
            setIsBad(true);
            return;
        }

        const response = await api.post("/api/auth/set-password", {
            password: password,
            token: router.query.token as string,
        }).catch((error) => {
            if (error.response?.data) {
                setMessage(error.response.data.message);
                setIsBad(true);
            }
            else {
                setMessage("An error occurred");
                setIsBad(true);
            }
        });

        if (response?.status === 200) {
            setMessage("Password updated");
            setIsBad(false);

            // Redirect to the login page
            router.push("/login");
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
                        <Card className="min-w-96 w-1/4 flex-col justify-center items-center m-10">
                            <h1 className="text-4xl font-bold">
                                Password Reset
                            </h1>
                            <div className="flex-col justify-center items-center">
                                <p className="text-lg">
                                    Enter your new password.
                                </p>
                                <TextInput type="password" placeholder="" value={password} onChange={(e) => setPassword(e.target.value)} >
                                </TextInput>
                                <p className={`text-sm text-center ${isBad ? 'text-red-500' : 'text-text'}`}  >
                                    {message}
                                </p>
                                <button className="text-lg transition-all duration-300 hover:bg-primary/80 bg-primary p-2 rounded-md shadow-md w-full my-1" onClick={handlePasswordSet}>
                                    Reset
                                </button>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}