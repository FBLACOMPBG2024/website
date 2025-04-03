import api from "@/utils/api";
import { Transaction } from "@/schemas/transactionSchema";

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