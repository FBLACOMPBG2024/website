import React from "react";
import { useRouter } from "next/router";
import { useUser } from "@/components/context/UserContext";
export default function Topbar() {
  const router = useRouter();
  const { user } = useUser();

  return (
    <header className="transition-colors duration-500 bg-background shadow-md shadow-primary border-b border-primary w-full">
      <div className="flex justify-between items-center p-3 bg-background">
        {/* Logo / Title */}
        <h1
          className="font-bold text-2xl sm:text-3xl select-none whitespace-nowrap"
          onClick={() => router.push('/')}
        >
          Smart Spend
        </h1>

        {/* Buttons */}
        <div className="flex space-x-4">

          {user ? (
            <>
            </>
          ) : (
            <>
              <button
                className="px-4 text-lg sm:text-xl font-semibold whitespace-nowrap"
                onClick={() => router.push('/login')}
              >
                Login
              </button>
              <button
                className="px-4 py-1 text-lg sm:text-xl font-semibold rounded-md border-neutral-600 border-2 whitespace-nowrap"
                onClick={() => router.push('/sign-up')}
              >
                Sign Up
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
