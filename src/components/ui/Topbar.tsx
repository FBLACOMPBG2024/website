import React from "react";
import { useRouter } from "next/router";
import { useUser } from "@/components/context/UserContext";

// Topbar - displays logo and auth navigation buttons

export default function Topbar() {
  const router = useRouter();
  const { user } = useUser();

  return (
    <header className="transition-colors duration-500 bg-background shadow-md shadow-primary border-b border-primary w-full">
      <div className="flex justify-between items-center p-3 w-full">
        {/* Logo / title */}
        <h1
          className="font-bold text-2xl sm:text-3xl select-none whitespace-nowrap cursor-pointer"
          onClick={() => router.push("/")}
          aria-label="Go to home page"
        >
          SmartSpend
        </h1>

        {/* Auth buttons */}
        <div className="flex space-x-4">
          {user?.email ? (
            <>
              <button
                className="text-lg sm:text-xl font-semibold whitespace-nowrap"
                onClick={() => router.push("/dashboard")}
                aria-label="Go to dashboard"
              >
                Dashboard
              </button>
              <button
                className="px-2 sm:px-4 py-0.5 sm:py-1 text-lg sm:text-xl font-semibold rounded-md border-2 border-neutral-600 whitespace-nowrap"
                onClick={() => router.push("/logout")}
                aria-label="Log out"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <button
                className="px-4 text-lg sm:text-xl font-semibold whitespace-nowrap"
                onClick={() => router.push("/login")}
                aria-label="Go to login page"
              >
                Login
              </button>
              <button
                className="px-4 py-1 text-lg sm:text-xl font-semibold rounded-md border-2 border-neutral-600 whitespace-nowrap"
                onClick={() => router.push("/sign-up")}
                aria-label="Go to sign up page"
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
