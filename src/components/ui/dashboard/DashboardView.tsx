import Card from "@/components/ui/Card";
import { motion } from "framer-motion";
import { IUser } from "@/components/context/UserContext";

interface DashboardViewProps {
    user: IUser;
}

export default function DashboardView({ user }: DashboardViewProps) {
    return (
        <Card className="h-full w-full" >
            <h1 className="text-2xl font-bold text-text">Dashboard</h1>

            <motion.h1
                key={user.balance}
                initial={{ y: 0 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.5 }}
            >
                {user.balance.toLocaleString("en-US", { style: "currency", currency: "USD" }).split("").map((char, index) => (
                    <motion.span
                        key={index}
                        initial={{ opacity: 0, rotateX: 45 }}
                        animate={{ opacity: 1, rotateX: 0 }}
                        exit={{ opacity: 0, rotateX: -45 }}
                        transition={{ duration: 0.1, delay: index * 0.1 }}
                    >
                        {char}
                    </motion.span>
                ))}
            </motion.h1>

        </Card >
    );
}
