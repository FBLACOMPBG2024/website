import { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import { IUser } from "@/components/context/UserContext";
import api from "@/utils/api";

interface TransactionsViewProps {
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

export default function TransactionsView({ user }: TransactionsViewProps) {

    return (
        <div>
            <Card className="">
                <h1 className="text-2xl font-bold text-text">Transactions</h1>

            </Card>
        </div>
    );
}
