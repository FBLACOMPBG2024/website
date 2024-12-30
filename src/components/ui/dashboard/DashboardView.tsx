import { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import { motion } from "framer-motion";
import { IUser } from "@/components/context/UserContext";
import api from "@/utils/api"; // Assuming this is your API utility file
import ReactECharts from "echarts-for-react";

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

let pieOption = {
  backgroundColor: "#171717",
  tooltip: {
    trigger: "item",
  },
  legend: {
    top: "bottom",
    left: "center",
  },
  series: [
    {
      name: "Spending Diversity",
      type: "pie",
      radius: ["40%", "70%"],
      avoidLabelOverlap: false,
      padAngle: 5,
      itemStyle: {
        borderRadius: 5,
        color: "#31D88A",
      },
      labelLine: {
        show: false,
      },
      data: [],
    },
  ],
};

export default function DashboardView({ user }: DashboardViewProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [pieData, setPieData] = useState<any[]>([]);

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

    async function fetchSummary() {
      setLoading(true);
      setError(null); // Reset error state on each request

      try {
        const response = await api.get("api/transaction/summary").catch((error) => {
          console.error(error);
          setError("Failed to fetch summary.");
        });

        if (response?.status == 200) {
          const data = response.data;
          setPieData(data);
        }
      } catch (error: any) {
        console.error("Error fetching summary:", error);
        setError("An error occurred while fetching summary.");
      } finally {
        setLoading(false);
      }
    }

    fetchSummary();
  }, [user]); // Dependency array: this will run whenever user.token changes

  useEffect(() => {
    pieOption.series[0].data = pieData;
  }, [pieData]);

  let option = {
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
        data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
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
        data: [120, 132, 101, 134, 90, 230, 210],
      },
    ],
  };

  return (
    <div>
      <Card className="flex flex-col md:flex-row">
        <div className="w-1/2 h-full">
          <h1 className="text-2xl font-bold text-text">Dashboard</h1>

          <motion.h1
            key={user.balance}
            initial={{ y: 0 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {user.balance
              .toLocaleString("en-US", { style: "currency", currency: "USD" })
              .split("")
              .map((char, index) => (
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
          <ReactECharts className="w-5/6" option={pieOption} />
        </div>
      </Card>
    </div>
  );
}
