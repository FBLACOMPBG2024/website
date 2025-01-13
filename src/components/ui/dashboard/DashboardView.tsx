import { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import { motion } from "framer-motion";
import { IUser } from "@/components/context/UserContext";
import api from "@/utils/api";
import ReactECharts from "echarts-for-react";
import router from "next/router";

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
  const [chartData, setChartData] = useState<number[]>([]);
  const [chartLabels, setChartLabels] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/transaction/get", {
        params: { limit: 6 },
      });
      setTransactions(response.data);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      setError("Failed to fetch transactions.");
    } finally {
      setLoading(false);
    }
  };

  const fetchChartData = async () => {
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

  useEffect(() => {
    if (user) {
      fetchTransactions();
      fetchChartData();
    } else {
      router.reload();
    }
  }, [user]);

  const balance = (user?.balance || 0).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });

  const chartOptions = {
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "cross",
        label: { backgroundColor: "#171717" },
      },
    },
    grid: {
      top: "3%",
      left: "3%",
      right: "4%",
      bottom: "3%",
      containLabel: true,
    },
    xAxis: [
      {
        type: "category",
        data: chartLabels.length
          ? chartLabels
          : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      },
    ],
    yAxis: [{ type: "value" }],
    series: [
      {
        color: "#31D88A",
        name: "Balance",
        type: "line",
        stack: "Total",
        areaStyle: {},
        emphasis: { focus: "series" },
        data: chartData.length ? chartData : [120, 132, 101, 134, 90, 230, 210],
      },
    ],
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div className="gap-4">
      <Card>
        <div className="flex gap-4 items-center justify-between">
          <h1 className="text-4xl font-black text-text">Dashboard</h1>
          <motion.h1
            key={balance}
            initial={{ y: 0 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="font-bold">Balance: </span>
            {balance.split("").map((char, index) => (
              <motion.span
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.1, delay: index * 0.1 }}
              >
                <span
                  className={`font-bold ${user?.balance < 0 ? "text-red-500" : ""}`}
                >
                  {char}
                </span>
              </motion.span>
            ))}
          </motion.h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-text pb-3">
              Spending Summary
            </h2>
            <ReactECharts className="w-full" option={chartOptions} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-text pb-3">
              Latest Transactions
            </h2>
            {transactions.length === 0 ? (
              <div className="text-text">No transactions found.</div>
            ) : (
              <ul>
                {transactions.map((transaction, index) => (
                  <motion.li
                    key={transaction._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="py-2 border-b border-backgroundGrayLight"
                  >
                    <div className="flex justify-between">
                      <div>
                        <span className="font-medium text-text">
                          {transaction.name}
                        </span>
                      </div>
                      <span
                        className={
                          transaction.value > 0 ? "text-green-500" : "text-text"
                        }
                      >
                        {transaction.value.toLocaleString("en-US", {
                          style: "currency",
                          currency: "USD",
                        })}
                      </span>
                    </div>
                  </motion.li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
