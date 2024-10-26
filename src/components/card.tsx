import React, { ReactNode } from "react";
import clsx from "clsx";

interface CardProps {
    children?: ReactNode;
    className?: string;
}

export default function Card({ children, className }: CardProps) {
    return (
        <div className={clsx("transition-colors duration-500 bg-backgroundGray p-4 rounded-lg shadow-md text-2xl", className)}>
            {children}
        </div>
    );
}
