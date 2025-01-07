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
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [chartData, setChartData] = useState<string[]>([]);
  const [chartLabels, setChartLabels] = useState<string[]>([]);

  const option = {
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "cross",
        label: {
          backgroundColor: "#171717",
        },
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
        data:
          chartLabels.length > 0
            ? chartLabels
            : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      },
    ],
    yAxis: [
      {
        type: "value",
      },
    ],
    series: [
      {
        color: "#31D88A",
        name: "Balance",
        type: "line",
        stack: "Total",
        areaStyle: {},
        emphasis: {
          focus: "series",
        },
        data:
          chartData.length > 0 ? chartData : [120, 132, 101, 134, 90, 230, 210],
      },
    ],
  };
  const fetchTransactions = async () => {
    try {
      const queryParams: any = {
        limit: 6, // Fetch the last 3 transactions
      };

      const response = await api.get("/api/transaction/get", {
        params: queryParams,
      });
      setTransactions(response.data);
    } catch (error) {
      console.error("Failed to fetch transactions", error);
    }
  };

  useEffect(() => {
    async function fetchChartData() {
      try {
        const response = await api
          .get("api/transaction/summary")
          .catch((error) => {
            console.error(error);
            setError("Failed to fetch chart data.");
          });

        if (response?.status === 200) {
          const summaryData = response.data;
          setChartLabels(summaryData.labels);
          setChartData(summaryData.data);
        }
      } catch (error: any) {
        console.error("Error fetching chart data:", error);
        setError("An error occurred while fetching chart data.");
      }
    }

    fetchTransactions();
    fetchChartData();
  }, [user]);

  if (!user || typeof user.balance === "undefined") {
    router.reload();
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  const balance = (user.balance || 0).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });

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
                  className={`font-bold ${user.balance < 0 ? "text-red-500" : ""}`}
                >
                  {char}
                </span>
              </motion.span>
            ))}
          </motion.h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="w-full h-full">
            <h2 className="text-2xl font-bold text-text pb-3">
              Spending Summary
            </h2>
            <ReactECharts className="w-full" option={option} />
          </div>

          <div className="w-full h-full">
            <h2 className="text-2xl font-bold text-text pb-3">
              Latest Transactions
            </h2>

            {transactions.length === 0 && (
              <div className="text-text">No transactions found.</div>
            )}
            <ul>
              {transactions.map((transaction: Transaction, index: number) => (
                <motion.li
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }} // Adjust exit animation to slide out
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  key={index}
                  className="py-2 border-b border-backgroundGrayLight"
                >
                  <div className="flex justify-between">
                    <div>
                      <span className="font-medium text-text">
                        {transaction.name}
                      </span>
                      {/* <span className="text-ellipsis text-neutral-500 text-sm text-left pl-2 align-middle">
                        {transaction.description}
                      </span> */}
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
          </div>
        </div>
      </Card>
    </div>
  );
}
