import React, { ReactNode } from "react";
import clsx from "clsx"; // Optional, for better class name handling

interface TextInputProps {
    children?: ReactNode;
    className?: string; // Optional className prop for custom styles
    type?: string;
    placeholder?: string;
}

export default function TextInput({ children, className, type, placeholder }: TextInputProps) {
    return (
        <input type={type} placeholder={placeholder} className={clsx("text-lg bg-backgroundGrayLight p-2 rounded-md shadow-md border-b border-primary text-neutral-500 focus:outline-0", className)}>
            {children}
        </input>
    );
}
