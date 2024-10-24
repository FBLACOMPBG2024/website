import React from "react";

export default function Topbar() {
  return (
    <header className="bg-background shadow-md shadow-primary border-b border-primary w-full">
      <div className="flex justify-between items-center p-3 bg-background">
        {/* Logo / Title */}
        <h1 className="font-bold text-3xl">Smart Spend</h1>

        {/* Buttons */}
        <div className="flex space-x-4">
          <button className="px-4 text-lg sm:text-xl font-semibold">Sign In</button>
          <button className="px-4 py-1 text-lg sm:text-xl font-semibold rounded-md border-neutral-600 border-2">
            Sign Up
          </button>
        </div>
      </div>
    </header>
  );
}
