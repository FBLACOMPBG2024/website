import { useState } from "react";
import Card from "@/components/ui/Card";
import Modal from "@/components/ui/Modal";
import api from "@/utils/api";
import { IUser } from "@/components/context/UserContext";
import TextInput from "@/components/ui/TextInput";

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

  // Individual state variables for each input
  const [value, setValue] = useState("0.0");
  const [tags, setTags] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const flagsArray = tags.split(",");
    // Prepare payload from individual states
    const payload = {
      value: parseFloat(value) || 0,
      flags: flagsArray,
      name,
      description,
    };

    try {
      const response = await api.post("/api/transaction/add", payload);
      if (response.status === 201) {
        setIsModalOpen(false);
        // Reset the fields after successful submission
        setValue("0.0");
        setTags("");
        setName("");
        setDescription("");
      }
    } catch (error) {
      console.error("Failed to create transaction", error);
    }
  };

  return (
    <div>
      <Card className="">
        <h1 className="text-2xl font-bold text-text">Transactions</h1>
        <button
          className="mt-4 px-4 py-2 bg-primary text-white rounded"
          onClick={() => setIsModalOpen(true)}
        >
          Add Transaction
        </button>
      </Card>

      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <form onSubmit={handleSubmit}>
          <h1 className="text-2xl font-bold text-text">Create Transaction</h1>
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
            Create Transaction
          </button>
        </form>
      </Modal>
    </div>
  );
}
