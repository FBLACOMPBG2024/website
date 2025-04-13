import { motion } from "framer-motion";
import { Transaction } from "@/schemas/transactionSchema";

export default function TransactionItem({
  transaction,
  index,
}: {
  transaction: Transaction;
  index: number;
}) {
  return (
    <motion.li
      key={transaction._id.toString()}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="py-2 border-b border-backgroundGrayLight"
    >
      <div className="flex justify-between">
        <span className="font-medium text-text">{transaction.name}</span>
        <span
          className={
            transaction.value > 0 ? "text-green-500" : "text-neutral-500"
          }
        >
          {transaction.value.toLocaleString("en-US", {
            style: "currency",
            currency: "USD",
          })}
        </span>
      </div>
    </motion.li>
  );
}
