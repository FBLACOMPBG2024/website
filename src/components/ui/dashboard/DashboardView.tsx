import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/router";
import ReactECharts from "echarts-for-react";
import Card from "@/components/ui/Card";
import { IUser } from "@/components/context/UserContext";
import { fetchTransactions, fetchChartData } from "@/utils/apiHelpers";
import {
  generateTreemapData,
  generateSecondTagChartData,
} from "@/utils/dataProcessing";
import {
  lineChartOptions,
  pieChartOptions,
  treemapChartOptions,
} from "@/utils/chartOptions";
import { Transaction } from "@/schemas/transactionSchema";

interface DashboardViewProps {
  user: IUser;
}

export default function DashboardView({ user }: DashboardViewProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [chartData, setChartData] = useState<number[]>([]);
  const [chartLabels, setChartLabels] = useState<string[]>([]);
  const [treemapData, setTreemapData] = useState<any[]>([]);
  const [pieChartData, setPieChartData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [dateRange, setDateRange] = useState<string>("last7days");



  const router = useRouter();

  useEffect(() => {
    if (user.firstName) {
      fetchTransactions(setTransactions, setError, setLoading, dateRange);
      fetchChartData(setChartLabels, setChartData, setError, setLoading, dateRange);
    }
  }, [user, dateRange]);


  useEffect(() => {
    if (transactions.length > 0) {
      setTreemapData(generateTreemapData(transactions));
      setPieChartData(generateSecondTagChartData(transactions));
    }
  }, [transactions]);

  const balance = (user?.balance || 0).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="gap-4">
      <Card>
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <h1 className="text-4xl font-black text-text">Dashboard</h1>
          <motion.h1
            key={balance}
            initial={{ y: 0 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center md:text-right"
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
            <select
              className="ml-5 bg-backgroundGrayLight p-2 text-base rounded-md"
              value={dateRange}
              onChange={(e) => {
                const selectedDateRange = e.target.value;
                setDateRange(selectedDateRange);
              }}
            >
              <option value="last7days">Last Week</option>
              <option value="last30days">Last Month</option>
              <option value="last90days">Last 3 Months</option>
            </select>
          </motion.h1>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <h1 className="text-2xl font-black text-text">
              Spending Over Time
            </h1>
            <ReactECharts
              className="w-full"
              option={lineChartOptions(chartLabels, chartData)}
            />
          </div>
          <div>
            <h1 className="text-2xl font-black text-text">Spending</h1>
            <ReactECharts
              className="w-full"
              option={pieChartOptions(pieChartData)}
            />
          </div>
          <div>
            <h1 className="text-2xl font-black text-text">
              Spending Distribution
            </h1>
            <ReactECharts
              className="w-full"
              option={treemapChartOptions(treemapData)}
            />
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-text pb-3">
            Latest Transactions
          </h2>
          {transactions.length === 0 ? (
            <div className="text-text">No transactions found.</div>
          ) : (
            <ul>
              {transactions.slice(0, 6).map((transaction, index) => (
                <motion.li
                  key={transaction._id.toString()}
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
                        transaction.value > 0
                          ? "text-green-500"
                          : "text-neutral-500"
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
      </Card>
    </div>
  );
}
