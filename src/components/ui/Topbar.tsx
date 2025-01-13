import React from "react";
import { useRouter } from "next/router";
import { useUser } from "@/components/context/UserContext";

// The Topbar component represents the header with the application logo and login/logout buttons.

export default function Topbar() {
  const router = useRouter();
  const { user } = useUser();

  return (
    <header className="transition-colors duration-500 bg-background shadow-md shadow-primary border-b border-primary w-full">
      <div className="flex justify-between items-center p-3 bg-background w-full">
        {/* Logo / Title */}
        <h1
          className="transition-all font-bold text-2xl sm:text-3xl select-none whitespace-nowrap cursor-pointer"
          onClick={() => router.push("/")}
          aria-label="Go to home page"
        >
          Smart Spend
        </h1>

        {/* Buttons */}
        <div className="flex space-x-4">
          {user?.email ? (
            <>
              <button
                className="transition-all sm:pr-3 pr-0 text-lg sm:text-xl font-semibold whitespace-nowrap"
                onClick={() => router.push("/dashboard")}
                aria-label="Go to dashboard"
              >
                Dashboard
              </button>
              <button
                className="transition-all sm:px-4 sm:py-1 sm:text-xl text-lg px-2 py-0.5 font-semibold rounded-md border-neutral-600 border-2 whitespace-nowrap"
                onClick={() => router.push("/logout")}
                aria-label="Log out"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <button
                className="transition-all px-4 text-lg sm:text-xl font-semibold whitespace-nowrap"
                onClick={() => router.push("/login")}
                aria-label="Go to login page"
              >
                Login
              </button>
              <button
                className="transition-all px-4 py-1 text-lg sm:text-xl font-semibold rounded-md border-neutral-600 border-2 whitespace-nowrap"
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
