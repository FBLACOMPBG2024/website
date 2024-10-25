import Topbar from "@/components/topbar";
import client from "@/lib/mongodb";


export default function Home() {
  return (
    <div className="flex flex-col h-screen w-screen">
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
                  Smart Spend
                </span>
                <p className="text-xl font-bold mt-4">
                  Smart Spend allows users to manage their expenses with ease.
                  Check out our features below.
                </p>
              </div>
            </div>
            {/* Bordered div */}
            <div className="w-[35vh] h-[70vh] border border-lime-100" />
          </div>
        </div>
      </div>
    </div>
  );
}
