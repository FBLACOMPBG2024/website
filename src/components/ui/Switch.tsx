import React, { useState } from "react";
import clsx from "clsx";
import { motion } from "framer-motion";
interface SwitchProps {
    checked?: boolean;
    onCheckedChange: (checked: boolean) => void;
}

export default function Switch({ checked: initialChecked, onCheckedChange }: SwitchProps) {
    const [checked, setChecked] = useState(initialChecked);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setChecked(e.target.checked);
        onCheckedChange(e.target.checked);
    };

    const handleCircleClick = () => {
        setChecked(!checked);
        onCheckedChange(!checked);
    };

    return (
        <div className="flex rounded-full bg-backgroundGrayLight w-fit">
            <input className="hidden" type="checkbox" checked={checked} onChange={handleChange} />
            <div className="w-10 h-5 rounded-full bg-backgroundGrayLight relative" onClick={handleCircleClick}>
                <motion.div
                    className={clsx("h-full w-1/2 rounded-full bg-primary absolute left-0 top-0 -translate-y-1/2")}
                    animate={{ x: checked ? "100%" : "0%" }}
                    transition={{ duration: 0.2 }}
                />
            </div>
        </div>
    );
}
