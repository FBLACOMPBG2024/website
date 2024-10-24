import React, { ReactNode } from "react";
import clsx from "clsx"; // Optional, for better class name handling

interface CardProps {
    children: ReactNode;
    className?: string; // Optional className prop for custom styles
}

export default function Card({ children, className }: CardProps) {
    return (
        <div className={clsx("bg-backgroundGray p-4 rounded-lg shadow-md text-2xl", className)}>
            {children}
        </div>
    );
}
