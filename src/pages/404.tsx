import Topbar from "@/components/ui/Topbar";
import { useRouter } from "next/router";

export default function Custom404() {
  let router = useRouter();

  return (
    <div className="flex flex-col h-screen w-screen">
      {/* Topbar */}
      <Topbar />
      <div className="w-full h-screen flex items-center justify-center">
        <div className="text-center">
          <a className="text-text text-7xl font-bold">404</a>
          <h1
            className=""
            onClick={() => {
              router.push("/");
            }}
          >
            Not found
          </h1>
          <h1
            className="underline font-bold"
            onClick={() => {
              router.push("/");
            }}
          >
            Go home
          </h1>
        </div>
      </div>
    </div>
  );
}
