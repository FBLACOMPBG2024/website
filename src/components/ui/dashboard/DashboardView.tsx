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
  const [treemapData, setTreemapData] = useState<any[]>([]); // State for treemap data
  const [pieChartData, setPieChartData] = useState<any[]>([]); // State for pie chart data
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/transaction/get", {
        params: { limit: 100 },
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

  const generateSecondTagChartData = (transactions: Transaction[]) => {
    const secondTagData: Record<string, number> = {}; // Record to store aggregated data by second tag

    // Iterate through each transaction
    transactions.forEach((transaction) => {
      if (transaction.tags.length > 1) {
        const secondTag = transaction.tags[1]; // Use the second tag
        if (!secondTagData[secondTag]) {
          secondTagData[secondTag] = 0;
        }
        // Sum up the transaction values based on the second tag
        secondTagData[secondTag] += -transaction.value; // Use negative value as we are showing expenses
      }
    });

    // Convert the aggregated data into an array for the pie chart
    const pieData = Object.keys(secondTagData).map((tag) => ({
      name: tag,
      value: secondTagData[tag],
    }));

    return pieData;
  };

  const generateTreemapData = (transactions: Transaction[]) => {
    const map: Record<string, any> = {};  // A map to hold aggregated data by tags
    const processedTransactions: Set<string> = new Set(); // To track unique transactions

    // Group transactions by tags
    transactions.forEach((transaction) => {
      // For each transaction, we will create a unique identifier based on tags
      const uniqueTransactionIdentifier = transaction.tags.sort().join('-') + transaction._id;

      // Skip if this transaction has already been processed
      if (processedTransactions.has(uniqueTransactionIdentifier)) {
        return;
      }

      // Add the transaction to the processed set
      processedTransactions.add(uniqueTransactionIdentifier);

      // Loop through all the tags for each transaction
      transaction.tags.forEach((tag) => {
        if (!map[tag]) {
          // Initialize the tag if it doesn't exist
          map[tag] = { name: tag, value: 0, children: [] };
        }

        // Add the transaction to the children of the tag
        map[tag].children.push({
          name: transaction.name,
          value: -transaction.value,  // Store the transaction value as a negative value
        });

        // Increment the value of the tag by the transaction value
        map[tag].value += -transaction.value;
      });
    });

    // Convert the map to an array of treemap data
    const treemapData = Object.values(map).map((category) => {
      return {
        name: category.name,
        value: category.value,
        children: category.children.length > 0 ? category.children : null,
      };
    });

    return treemapData;
  };

  useEffect(() => {
    if (user) {
      fetchTransactions();
      fetchChartData();
    } else {
      router.reload();
    }
  }, [user]);

  useEffect(() => {
    if (transactions.length > 0) {
      // Generate treemap data
      const treemapData = generateTreemapData(transactions);
      setTreemapData(treemapData);  // Set the treemap data

      // Generate pie chart data for second tag
      const pieChartData = generateSecondTagChartData(transactions);
      setPieChartData(pieChartData);  // Update pie chart data
    }
  }, [transactions]);

  const balance = (user?.balance || 0).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });

  const pieChartOptions = {
    tooltip: {
      trigger: 'item'
    },
    legend: {
      top: '5%',
      left: 'center'
    },
    series: [
      {
        name: 'Spending by Second Tag',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10
        },
        label: {
          show: true,
          position: 'outside'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 40,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: true
        },
        data: pieChartData,  // Use the dynamically generated pie chart data
      }
    ]
  };

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

  const treemapChartOptions = {
    title: {
      text: 'Spending by Category',
      left: 'center',
    },
    tooltip: {
      trigger: 'item',
      formatter: function (info: any) {

        if (info.value >= 0) {
          return;
        }

        const value = -info.value;
        const treePathInfo = info.treePathInfo;
        const treePath = treePathInfo.map((path: any) => path.name).slice(1); // Path to item

        // Custom implementation of encodeHTML (to prevent XSS)
        const encodeHTML = (str: string) => {
          const element = document.createElement('div');
          if (str) {
            element.innerText = str;
            element.textContent = str;
          }
          return element.innerHTML || '';
        };

        // Custom implementation of addCommas (to add commas to numbers)
        const addCommas = (num: number) => {
          return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        };

        return [
          `<div class="tooltip-title">${encodeHTML(treePath.join('/'))}</div>`,
          `Total Spending: $${addCommas(value)}`,
        ].join('');
      },
    },
    series: [
      {
        name: 'Spending Categories',
        type: 'treemap',
        visibleMin: 300,
        label: {
          show: true,
          formatter: '{b}', // Show the category name
        },
        itemStyle: {
          borderColor: '#fff',
        },
        levels: [
          {
            itemStyle: {
              borderWidth: 0,
              gapWidth: 5
            }
          },
          {
            itemStyle: {
              gapWidth: 1
            }
          },
          {
            colorSaturation: [0.35, 0.5],
            itemStyle: {
              gapWidth: 1,
              borderColorSaturation: 0.6
            }
          }
        ],
        data: treemapData, // This is the data from your generateTreemapData function
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
              Spending by Category
            </h2>
            {treemapData.length > 0 ? (
              <ReactECharts className="w-full" option={treemapChartOptions} />
            ) : (
              <div>Loading treemap...</div>
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-text pb-3">
              Spending by Transaction Type (Second Tag)
            </h2>
            {pieChartData.length > 0 ? (
              <ReactECharts className="w-full" option={pieChartOptions} />
            ) : (
              <div>Loading pie chart...</div>
            )}
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
                        className={transaction.value > 0 ? "text-green-500" : "text-neutral-500"}
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
