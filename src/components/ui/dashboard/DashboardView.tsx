import { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import { motion } from "framer-motion";
import { IUser } from "@/components/context/UserContext";
import api from "@/utils/api"; // Assuming this is your API utility file
import e from "cors";

interface DashboardViewProps {
    user: IUser;
}

interface Transaction {
    _id: string;
    value: number;
    tags: string[];
    name: string;
    description: string;
    createdAt: string;
    updatedAt: string;
}

export default function DashboardView({ user }: DashboardViewProps) {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        // Fetch all transactions for the user
        async function fetchTransactions() {
            setLoading(true);
            setError(null);  // Reset error state on each request
            try {
                const response = await api.get("api/transaction/get")
                    .catch((error) => {
                        console.error(error);
                        setError("Failed to fetch transactions.");
                    });

                if (response?.status == 200) {
                    setTransactions(response.data); // Set the data to state if request is successful
                }
            } catch (error: any) {
                console.error("Error fetching transactions:", error);
                setError("An error occurred while fetching transactions.");
            } finally {
                setLoading(false);
            }
        }

        fetchTransactions();
    }, [user]); // Dependency array: this will run whenever user.token changes

    return (
        <div>
            <Card className="">
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
            </Card>

            <Card className="mt-2 h-full w-full">
                <h2 className="text-xl font-semibold">Your Transactions</h2>

                {loading && <p>Loading transactions...</p>}
                {error && <p className="text-red-500">{error}</p>}

                <div className="mt-4">
                    {transactions.length > 0 ? (
                        <ul>
                            {transactions.map((transaction) => (
                                <li key={transaction._id} className="mb-4 border-b pb-4">
                                    <h3 className="text-lg font-semibold">{transaction.name}</h3>
                                    <p>{transaction.description}</p>
                                    <p className="text-sm text-gray-500">Tags: {transaction.tags.join(", ")}</p>
                                    <p className="font-bold">{transaction.value.toLocaleString("en-US", { style: "currency", currency: "USD" })}</p>
                                    <p className="text-sm text-gray-500">Created At: {new Date(transaction.createdAt).toLocaleString()}</p>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No transactions found.</p>
                    )}
                </div>
            </Card>
        </div>
    );
}
