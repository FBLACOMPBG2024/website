import { useEffect } from "react";
import { useRouter } from "next/router";
import Topbar from "@/components/topbar";
import Card from "@/components/card";
import { IconMail } from "@tabler/icons-react";

export default function Dashboard() {
    const router = useRouter();

    useEffect(() => {
        const timer = setTimeout(() => {
            router.push("/sign-in");
        }, 3000);

        return () => clearTimeout(timer);
    }, [router]);

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
                                Email Verified
                            </h1>
                            <div className="flex-col justify-center items-center">
                                <IconMail className="w-full h-full" />
                                <p className="text-lg text-center">
                                    Your email has been verified.
                                </p>
                                <p className="text-sm text-gray-500 text-center p-1">
                                    Redirecting to sign in...
                                </p>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
