import React, { ReactNode } from "react";
import clsx from "clsx";

interface TextInputProps {
    children?: ReactNode;
    className?: string;
    type?: string;
    placeholder?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export default function TextInput({ children, className, type, placeholder, value, onChange, onKeyDown }: TextInputProps) {
    return (
        <div className={clsx("transition-colors duration-500 text-lg bg-backgroundGrayLight p-2 rounded-md shadow-md text-neutral-500 outline-none border-b border-b-backgroundGrayLight focus-within:border-b-primary ", className)}>
            <input
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                onKeyDown={onKeyDown}
                className="bg-transparent outline-none w-full"
            />
            {children}
        </div>
    );
}
