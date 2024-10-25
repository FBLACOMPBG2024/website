import Topbar from "@/components/topbar";
import Card from "@/components/card";

export default function Dashboard() {
    return (
        <div className="flex flex-col h-screen w-screen">
            {/* Topbar */}
            <Topbar />
            {/* Gradient background that fills the remaining screen space */}
            <div className="flex-1 bg-gradient-to-bl from-background via-background to-backgroundGreen">
                <div className="h-full w-full flex justify-center items-center">
                    <div className="w-full h-full flex justify-center items-center">
                        <Card className="min-w-96 w-1/4 flex-col justify-center items-center m-10">
                            <h1 className="text-4xl font-bold p-2">
                                Email Verification
                            </h1>
                            <p className="text-lg p-2">
                                Please check your email for a verification link.
                            </p>
                            <p className="text-sm text-gray-500 p-2">
                                If you did not receive an email, you can request another one.
                            </p>
                            <button className="text-lg bg-primary p-2 rounded-md shadow-md w-full my-1">
                                Request another email
                            </button>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
