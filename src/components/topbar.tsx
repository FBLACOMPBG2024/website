import React from "react";
import { useRouter } from "next/router";

export default function Topbar() {
  const router = useRouter();

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
          <button
            className="px-4 text-lg sm:text-xl font-semibold whitespace-nowrap"
            onClick={() => router.push('/signin')}
          >
            Sign In
          </button>
          <button
            className="px-4 py-1 text-lg sm:text-xl font-semibold rounded-md border-neutral-600 border-2 whitespace-nowrap"
            onClick={() => router.push('/signup')}
          >
            Sign Up
          </button>
        </div>
      </div>
    </header>
  );
}
