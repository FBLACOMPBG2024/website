import { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import Modal from "@/components/ui/Modal";
import api from "@/utils/api";
import { IUser } from "@/components/context/UserContext";
import TextInput from "@/components/ui/TextInput";
import { IconPencil, IconTrash } from "@tabler/icons-react";
import { IconPlus } from "@tabler/icons-react";

interface TransactionsViewProps {
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

export default function TransactionsView({ user }: TransactionsViewProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [editTransaction, setEditTransaction] = useState<Transaction | null>(
    null
  );

  // Individual state variables for each input
  const [value, setValue] = useState("0.0");
  const [tags, setTags] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await api.get("/api/transaction/get");
        setTransactions(response.data);
      } catch (error) {
        console.error("Failed to fetch transactions", error);
      }
    };

    fetchTransactions();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const tagsArray = tags.split(" ").map((tag) => tag.trim());
    // Prepare payload from individual states
    const payload = {
      _id: editTransaction?._id,
      value: parseFloat(value) || 0,
      tags: tagsArray,
      name,
      description,
    };

    try {
      if (editTransaction) {
        // Edit existing transaction
        const response = await api.put(`/api/transaction/edit`, payload);
        if (response.status === 200) {
          setIsModalOpen(false);
          setEditTransaction(null);
        }
      } else {
        // Create new transaction
        const response = await api.post("/api/transaction/add", payload);
        if (response.status === 201) {
          setIsModalOpen(false);
        }
      }

      // Reset the fields after successful submission
      setValue("0.0");
      setTags("");
      setName("");
      setDescription("");

      // Fetch the updated transactions
      const updatedTransactions = await api.get("/api/transaction/get");
      setTransactions(updatedTransactions.data);
    } catch (error) {
      console.error("Failed to create or edit transaction", error);
    }
  };

  const handleEdit = (transaction: Transaction) => {
    setEditTransaction(transaction);
    setValue(transaction.value.toString());
    setTags(transaction.tags.join(" "));
    setName(transaction.name);
    setDescription(transaction.description);
    setIsModalOpen(true);
  };

  const handleDelete = async (transactionId: string) => {
    try {
      const response = await api.delete(`/api/transaction/delete`, {
        data: { transactionId },
      });
      if (response.status === 200) {
        // Fetch the updated transactions
        const updatedTransactions = await api.get("/api/transaction/get");
        setTransactions(updatedTransactions.data);
      }
    } catch (error) {
      console.error("Failed to delete transaction", error);
    }
  };

  return (
    <div>
      <Card className="relative">
        <h1 className="text-2xl font-bold text-text">Transactions</h1>
        <button
          className="absolute top-0 right-0 mt-4 mr-4 px-4 py-2 bg-primary text-white rounded flex items-center"
          onClick={() => setIsModalOpen(true)}
        >
          <IconPlus className="mr-2" /> Add Transaction
        </button>
        <table className="min-w-full mt-8 bg-backgroundGray">
          <thead>
            <tr className="text-left">
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Value</th>
              <th className="px-4 py-2">Tags</th>
              <th className="px-4 py-2">Description</th>
              <th className="px-4 py-2">Created At</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction: Transaction) => (
              <tr key={transaction._id}>
                <td className="border px-4 py-2">{transaction.name}</td>
                <td className="border px-4 py-2">{transaction.value}</td>
                <td className="border px-4 py-2">
                  {transaction.tags ? (
                    <div className="flex flex-wrap gap-1">
                      {transaction.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="bg-primary text-white px-2 py-1 rounded text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : (
                    ""
                  )}
                </td>
                <td className="border px-4 py-2">{transaction.description}</td>
                <td className="border px-4 py-2">
                  {new Date(transaction.createdAt).toLocaleString()}
                </td>
                <td className="border px-4 py-2 gap-2">
                  <button onClick={() => handleEdit(transaction)}>
                    <IconPencil />
                  </button>
                  <button onClick={() => handleDelete(transaction._id)}>
                    <IconTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <form onSubmit={handleSubmit}>
          <h1 className="text-2xl font-bold text-text">
            {editTransaction ? "Edit Transaction" : "Create Transaction"}
          </h1>
          <div>
            <label>
              Value:
              <TextInput
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                required
              />
            </label>
          </div>
          <div>
            <label>
              Tags:
              <TextInput
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                required
              />
            </label>
          </div>
          <div>
            <label>
              Name:
              <TextInput
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </label>
          </div>
          <div>
            <label>
              Description:
              <TextInput
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </label>
          </div>
          <button
            type="submit"
            className="w-full mt-4 px-4 py-2 bg-backgroundGray rounded"
          >
            {editTransaction ? "Update Transaction" : "Create Transaction"}
          </button>
        </form>
      </Modal>
    </div>
  );
}
