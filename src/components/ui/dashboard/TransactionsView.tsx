import { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import Modal from "@/components/ui/Modal";
import api from "@/utils/api";
import TextInput from "@/components/ui/TextInput";
import { IconPencil, IconTrash, IconPlus, IconUpload } from "@tabler/icons-react";
import Papa from "papaparse"; // Import PapaParse for CSV parsing

interface Transaction {
  _id: string;
  value: number;
  tags: string[];
  name: string;
  description: string;
  date: string;
}

export default function TransactionsView() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkUploadModalOpen, setIsBulkUploadModalOpen] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [editTransaction, setEditTransaction] = useState<Transaction | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);

  // Individual state variables for each input
  const [value, setValue] = useState("0.0");
  const [tags, setTags] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [dateTime, setDateTime] = useState(new Date().toISOString().slice(0, 16)); // Default to now

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

    // Remove trailing and leading spaces from tags and split by space
    const tagsArray = tags.trim().split(" ").map((tag) => tag.trim());
    // Prepare payload from individual states
    const payload = {
      value: parseFloat(value) || 0,
      tags: tagsArray,
      name,
      description,
      date: new Date(dateTime),
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
      setDateTime(new Date().toISOString().slice(0, 16)); // Reset to now

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
    setDateTime(new Date(transaction.date).toISOString().slice(0, 16));
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (!transactionToDelete) return;

    try {
      const response = await api.delete(`/api/transaction/delete`, {
        data: { transactionId: transactionToDelete },
      });
      if (response.status === 200) {
        // Fetch the updated transactions
        const updatedTransactions = await api.get("/api/transaction/get");
        setTransactions(updatedTransactions.data);
        setIsConfirmModalOpen(false);
        setTransactionToDelete(null);
      }
    } catch (error) {
      console.error("Failed to delete transaction", error);
    }
  };

  const confirmDelete = (transactionId: string) => {
    setTransactionToDelete(transactionId);
    setIsConfirmModalOpen(true);
  };

  const handleBulkUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    const fileInput = document.getElementById("csvFileInput") as HTMLInputElement;
    if (fileInput.files && fileInput.files[0]) {
      Papa.parse(fileInput.files[0], {
        header: true,
        complete: async (results) => {
          try {

            // Foreach transaction in the CSV, parse and format the data
            const finalTransactions = results.data.map((transaction: any) => {
              return {
                value: parseFloat(transaction.value) || 0,
                tags: transaction.tags.split(",").map((tag: string) => tag.trim()),
                name: transaction.name,
                description: transaction.description,
                date: new Date(transaction.date),
              };
            });

            const response = await api.post("/api/transaction/bulk-add", finalTransactions);
            if (response.status === 201) {
              setIsBulkUploadModalOpen(false);
              // Fetch the updated transactions
              const updatedTransactions = await api.get("/api/transaction/get");
              setTransactions(updatedTransactions.data);
            }
          } catch (error) {
            console.error("Failed to bulk upload transactions", error);
          }
        },
      });
    }
  };

  return (
    <div>
      <Card className="relative">
        <h1 className="text-2xl font-bold text-text">Transactions</h1>
        <div className="absolute top-0 right-0 mt-4 mr-4 flex space-x-2">
          <button
            className="transition-all sm:text-lg text-sm px-2 py-1 bg-primary text-white rounded flex items-center"
            onClick={() => setIsModalOpen(true)}
          >
            <IconPlus className="mr-1" /> Add Transaction
          </button>
          <button
            className="transition-all sm:text-lg text-sm px-2 py-1 bg-primary text-white rounded flex items-center"
            onClick={() => setIsBulkUploadModalOpen(true)}
          >
            <IconUpload className="mr-1" /> Bulk Upload
          </button>
        </div>

        {/* Table Wrapper for Responsiveness */}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-backgroundGray">
            <thead>
              <tr className="text-left">
                <th className="transition-all sm:text-lg text-sm px-4 py-2">Name</th>
                <th className="transition-all sm:text-lg text-sm px-4 py-2">Value</th>
                <th className="transition-all sm:text-lg text-sm px-4 py-2">Tags</th>
                <th className="transition-all sm:text-lg text-sm px-4 py-2">Description</th>
                <th className="transition-all sm:text-lg text-sm px-4 py-2">Created</th>
                <th className="transition-all sm:text-lg text-sm px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction: Transaction, index: number) => (
                <tr
                  key={index}
                  className={index < transactions.length - 1 ? "border-b border-backgroundGrayLight" : ""}
                >
                  <td className="px-4 py-2">{transaction.name}</td>
                  <td className="px-4 py-2">{transaction.value}</td>
                  <td className="px-4 py-2">
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
                  <td className="px-4 py-2">{transaction.description}</td>
                  <td className="px-4 py-2 text-sm md:text-base">
                    {new Date(transaction.date).toLocaleString()}
                  </td>

                  <td className="px-4 py-2 gap-2">
                    <button onClick={() => handleEdit(transaction)}>
                      <IconPencil />
                    </button>
                    <button onClick={() => confirmDelete(transaction._id)}>
                      <IconTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
          <div>
            <label>
              Date and Time:
              <TextInput
                type="datetime-local"
                value={dateTime}
                onChange={(e) => setDateTime(e.target.value)}
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

      <Modal open={isBulkUploadModalOpen} onClose={() => setIsBulkUploadModalOpen(false)}>
        <form onSubmit={handleBulkUpload}>
          <h1 className="text-2xl font-bold text-text">Bulk Upload</h1>
          <div>
            <label>
              Upload CSV:
              <input
                id="csvFileInput"
                type="file"
                accept=".csv"
                className="block w-full text-sm text-text border border-backgroundGrayLight rounded-lg cursor-pointer focus:outline-none"
                required
              />
            </label>
          </div>
          <button
            type="submit"
            className="w-full mt-4 px-4 py-2 bg-backgroundGray rounded"
          >
            Upload
          </button>
        </form>
      </Modal>

      <Modal open={isConfirmModalOpen} onClose={() => setIsConfirmModalOpen(false)}>
        <div className="p-4">
          <h2 className="text-xl font-bold text-text">Are you sure?</h2>
          <p className="text-text">Do you really want to delete this transaction? This process cannot be undone.</p>
          <div className="flex justify-end mt-4">
            <button
              className="mr-2 px-4 py-2 bg-gray-300 text-gray-800 rounded"
              onClick={() => setIsConfirmModalOpen(false)}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 bg-red-500 text-white rounded"
              onClick={handleDelete}
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}