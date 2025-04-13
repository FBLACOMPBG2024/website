import { motion } from "framer-motion";

export default function SummaryCard({
  title,
  amount,
  highlight = false,
}: {
  title: string;
  amount: number;
  highlight?: boolean;
}) {
  const formatted = Number(amount).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });

  return (
    <div className="p-4 rounded-xl shadow bg-backgroundGrayLight">
      <h2 className="text-sm font-medium text-mutedText">{title}</h2>
      <motion.div
        key={amount}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className={`text-xl font-bold ${
          highlight && amount < 0 ? "text-red-500" : ""
        }`}
      >
        {formatted}
      </motion.div>
    </div>
  );
}
