import Topbar from "@/components/ui/Topbar";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col h-screen w-screen overflow-clip">
      {/* Topbar */}
      <Topbar />

      {/* Gradient background that fills the remaining screen space */}
      <div className="flex-1 bg-gradient-to-bl from-background via-background to-backgroundGreen">
        <div className="h-full w-full flex justify-center items-center">
          <div className="flex flex-col md:flex-row justify-center items-center w-full space-y-8 md:space-y-0 md:space-x-8">
            {/* Text container */}
            <div className="w-11/12 md:w-8/12 lg:w-6/12 p-8">
              <div className="text-lg sm:text-l md:text-xl lg:text-2xl font-medium">
                <span className="block text-4xl font-bold">
                  Manage your expenses with
                </span>
                <span className="block text-4xl font-bold text-shadow-xxl shadow-primary text-primary">
                  SmartSpend
                </span>
                <p className="text-xl font-bold mt-4">
                  SmartSpend allows users to manage their expenses with ease.
                </p>
              </div>
            </div>

            {/* Image container */}
            <div className="w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl h-auto relative flex justify-center">
              <Image
                className="-rotate-12"
                src="/phone.png"
                alt="Phone"
                width={500}
                height={700}
                quality={100}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
