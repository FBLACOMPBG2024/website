import Topbar from "@/components/ui/Topbar";
import Card from "@/components/ui/Card";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function () {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/login");
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
              <h1 className="text-4xl font-bold">Email Verified</h1>
              <div className="flex-col justify-center">
                <p className="text-lg">Your email has been verified.</p>
                <p className="text-sm text-gray-500">Redirecting to login...</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
