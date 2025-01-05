import { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import { motion } from "framer-motion";
import { IUser } from "@/components/context/UserContext";
import api from "@/utils/api";
import ReactECharts from "echarts-for-react";

// This is a sample dashboard view component
// It displays the user's balance and other data in a card

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
  const [chartData, setChartData] = useState<number[]>([]); // For storing chart data
  const [chartLabels, setChartLabels] = useState<string[]>([]); // Store labels for x-axis, initialized with an empty array

  useEffect(() => {
    // Fetch all transactions for the user
    async function fetchTransactions() {
      setLoading(true);
      setError(null); // Reset error state on each request
      try {
        const response = await api.get("api/transaction/get").catch((error) => {
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

    async function fetchChartData() {
      try {
        const response = await api
          .get("api/transaction/summary")
          .catch((error) => {
            console.error(error);
            setError("Failed to fetch chart data.");
          });

        if (response?.status === 200) {
          const summaryData = response.data; // Assuming the summary data is in response.data

          // Assuming the response contains a 'data' object with day names as keys and values as totals
          const labels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
          const values = labels.map((day) => summaryData.data[day] || 0); // Map to day names and default to 0 if no data for the day

          // Update chart data and labels
          setChartData(values);
          setChartLabels(labels);
        }
      } catch (error: any) {
        console.error("Error fetching chart data:", error);
        setError("An error occurred while fetching chart data.");
      }
    }

    fetchTransactions();
    fetchChartData();
  }, [user]); // Dependency array: this will run whenever user.token changes

  // Option for the line chart, dynamically updated with chartData and chartLabels
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
            : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], // Fallback to default labels if no data
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
          chartData.length > 0 ? chartData : [120, 132, 101, 134, 90, 230, 210], // Fallback if no data available
      },
    ],
  };

  if (loading || !user || typeof user.balance === "undefined") {
    return <div>Loading...</div>;
  }

  const balance = (user.balance || 0).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });

  return (
    <div>
      <Card className="flex flex-col md:flex-row">
        <div className="w-1/2 h-full">
          <h1 className="text-2xl font-bold text-text">Dashboard</h1>

          <motion.h1
            key={balance}
            initial={{ y: 0 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {balance.split("").map((char, index) => (
              <motion.span
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.1, delay: index * 0.1 }}
              >
                {char}
              </motion.span>
            ))}
          </motion.h1>
        </div>
        <div className="w-1/2 h-full">
          <ReactECharts className="w-5/6" option={option} />
        </div>
      </Card>
    </div>
  );
}
