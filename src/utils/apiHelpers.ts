import api from "@/utils/api";
import { Transaction } from "@/schemas/transactionSchema";
import { Goal } from "@/schemas/goalSchema";
import { IUser } from "@/components/context/UserContext";
import Router from "next/router";
import { showError, showSuccess } from "./toast";

export const fetchTransactions = async (
    setTransactions: (transactions: Transaction[]) => void,
    setError: (error: string | null) => void,
    setLoading: (loading: boolean) => void
): Promise<void> => {
    try {
        setLoading(true);
        const response = await api.get("/api/transaction/get", { params: { limit: 100 } });
        setTransactions(response.data);
    } catch (error) {
        console.error("Error fetching transactions:", error);
        setError("Failed to fetch transactions.");
    } finally {
        setLoading(false);
    }
};

export const fetchChartData = async (
    setChartLabels: (labels: string[]) => void,
    setChartData: (data: number[]) => void,
    setError: (error: string | null) => void,
    setLoading: (loading: boolean) => void
): Promise<void> => {
    try {
        setLoading(true);
        const response = await api.get("/api/transaction/summary");
        if (response.status === 200) {
            const { labels, data } = response.data;
            setChartLabels(labels);
            setChartData(data);
        }
    } catch (error) {
        console.error("Error fetching chart data:", error);
        setError("Failed to fetch chart data.");
    } finally {
        setLoading(false);
    }
};

export const fetchGoals = async (): Promise<any> => {
    try {
        const response = await api.get("/api/user/goal/get");
        return response.data;
    } catch (error) {
        console.error("Error fetching goals:", error);
        throw new Error("Failed to fetch goals. Please try again later.");
    }
};

export const createGoal = async (goal: Goal): Promise<any> => {
    try {
        const response = await api.post("/api/user/goal/create", goal);
        return response.data;
    } catch (error) {
        console.error("Error creating goal:", error);
        throw new Error("Failed to create goal. Please try again later.");
    }
};

export const editGoal = async (goal: Goal): Promise<any> => {
    try {
        const response = await api.put("/api/user/goal/edit", goal);
        if (response.status === 200) {
            await Router.reload();
        }
        return response.data;
    } catch (error) {
        console.error("Error editing goal:", error);
        throw new Error("Failed to edit goal. Please try again later.");
    }
};

export const deleteGoal = async (goalId: string): Promise<any> => {
    try {
        const response = await api.delete("/api/user/goal/delete", {
            data: { goalId },
        });
        return response.data;
    } catch (error) {
        console.error("Error deleting goal:", error);
        throw new Error("Failed to delete goal. Please try again later.");
    }
};

export const connectBankAccount = async (accessToken: string): Promise<void> => {
    try {
        let response = await api.post("/api/user/bank-connect", { accessToken });

        if (response.status === 200) {
            showSuccess("Connected bank account");
        }

        await Router.reload();
    } catch (error) {
        showError("Unable to connect bank account. Please try again.");
        throw new Error("Unable to connect bank account. Please try again.");
    }
};

export const fetchBankAccounts = async (user: IUser): Promise<any> => {
    try {
        if (!user.bankAccessToken) throw new Error("No access token found.");
        const response = await api.get("/api/user/bank/accounts");
        return response.data;
    } catch (error) {
        console.error("Error fetching bank accounts:", error);
        throw new Error("Unable to fetch bank accounts. Please try again.");
    }
};

export const updateUserProfile = async (
    user: IUser,
    setLoading: (loading: boolean) => void
): Promise<void> => {
    setLoading(true);
    try {
        if (!user) throw new Error("User is required");

        if (!user.preferences || !user.preferences.accountId) {
            showError("Invalid user preferences");
            throw new Error("Invalid user preferences");
        }

        const updatedAccountId = user.preferences.accountId;

        if (updatedAccountId !== user.preferences.accountId) {
            const confirmChange = window.confirm(
                "Changing your account will remove the current account's transactions. Proceed?"
            );

            if (!confirmChange) {
                setLoading(false);
                return;
            }

            await api.delete("/api/transaction/bulk-delete");
        }

        await api.post("/api/user/info", {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            preferences: user.preferences,
        });

        await Router.reload();
    } catch (error) {
        console.error("Failed to update profile:", error);
        throw new Error("Unable to save profile. Please try again.");
    } finally {
        setLoading(false);
    }
};
