import React, { ReactNode } from "react";
import clsx from "clsx"; // Optional, for better class name handling

interface ButtonProps {
    children: ReactNode;
    className?: string; // Optional className prop for custom styles
}

export default function Button({ children, className }: ButtonProps) {
    return (
        <button className={clsx("text-lg bg-primary p-2 rounded-md shadow-md", className)}>
            {children}
        </button>
    );
}
