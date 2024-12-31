import React, { ReactNode } from "react";
import clsx from "clsx";

// This is a reusable card component
// It's used to display data in a visually appealing way
// Basically, it's a container with a shadow and rounded corners

interface CardProps {
  children?: ReactNode;
  className?: string;
}

export default function Card({ children, className }: CardProps) {
  return (
    <div
      className={clsx(
        "transition-colors duration-500 bg-backgroundGray p-4 rounded-lg shadow-md text-2xl",
        className,
      )}
    >
      {children}
    </div>
  );
}
