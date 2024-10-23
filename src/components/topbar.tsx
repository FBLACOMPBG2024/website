import React from "react";

export default function Topbar() {
  return (
    <header className="bg-background shadow-md shadow-primary border-b border-primary w-full">
      <div className="flex justify-between p-3 bg-background">
        <h1 className="font-bold text-3xl">Smart Spend</h1>
        <div className="">
          <button className="px-6 text-xl font-semibold">Sign Up</button>
          <button className="px-6 py-1 text-xl font-semibold rounded-md border-neutral-600 border-2">
            Sign Up
          </button>
        </div>
      </div>
    </header>
  );
}
