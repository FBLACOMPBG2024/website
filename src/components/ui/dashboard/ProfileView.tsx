import { IUser } from "@/components/context/UserContext";
import { useTellerConnect } from "teller-connect-react";
import TextInput from "@/components/ui/TextInput";
import { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import api from "@/utils/api";
import {
  connectBankAccount,
  fetchBankAccounts,
  updateUserProfile,
} from "@/utils/apiHelpers";
import { showWarning } from "@/utils/toast";

interface ProfileViewProps {
  user: IUser;
}

interface BankAccount {
  id: string;
  name: string;
}

export default function ProfileView({ user }: ProfileViewProps) {
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [email, setEmail] = useState(user.email);
  const [theme, setTheme] = useState(user.preferences.theme || "system");
  const [accountId, setAccountId] = useState(user.preferences.accountId);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { open, ready } = useTellerConnect({
    applicationId: "app_p8gs0depa90f4sgbou000",
    appearance: "dark",
    environment:
      process.env.NODE_ENV === "development" ? "sandbox" : "development",
    onSuccess: async (authorization) => {
      try {
        await connectBankAccount(authorization.accessToken);
      } catch (err: any) {
        setError(err.message);
        console.error(err);
      }
    },
  });

  useEffect(() => {
    async function loadBankAccounts() {
      try {
        const accounts = await fetchBankAccounts(user);
        setBankAccounts(accounts);
      } catch (err: any) {
        setError(err.message);
      }
    }

    if (user.bankAccessToken) loadBankAccounts();
  }, [user]);

  const handleSave = async () => {
    if (loading) return;

    const updatedUser: IUser = {
      ...user,
      firstName,
      lastName,
      email,
      preferences: {
        ...user.preferences,
        theme,
        accountId,
      },
    };

    try {
      // If the user has changed their accountId
      if (accountId !== user.preferences.accountId) {
        const confirmChange = window.confirm(
          "Changing your account will remove the current account's transactions. Proceed?"
        );
        if (!confirmChange) return;
        await api.delete("/api/transaction/bulk-delete");
        showWarning("Transactions deleted");
      }

      await updateUserProfile(updatedUser, setLoading);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <Card className="h-full w-full">
      <h1 className="text-4xl font-black text-text">Profile</h1>
      <div className="flex flex-row gap-4">
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-bold text-text">First Name</h2>
          <TextInput
            className="w-fit"
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-bold text-text">Last Name</h2>
          <TextInput
            className="w-fit"
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>
      </div>
      <div className="flex flex-col pt-2">
        <h2 className="text-lg font-bold text-text">Email</h2>
        <TextInput
          className="w-fit"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div>
        <h2 className="text-lg font-bold text-text">Theme</h2>
        <select
          className="bg-backgroundGrayLight p-2 h-8 text-base rounded-md"
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
        >
          <option value="system">System</option>
          <option value="dark">Dark</option>
          <option value="light">Light</option>
        </select>
      </div>
      <div>
        <h2 className="text-lg font-bold text-text">Account</h2>
        <select
          className="bg-backgroundGrayLight p-2 h-8 text-base rounded-md"
          value={accountId}
          onChange={(e) => setAccountId(e.target.value)}
        >
          {bankAccounts.map((account) => (
            <option key={account.id} value={account.id}>
              {account.name}
            </option>
          ))}
        </select>
      </div>
      <div className="pt-4 flex flex-row justify-between items-center">
        <button
          className="text-lg bg-primary text-white rounded-md shadow-md py-1 px-3 disabled:opacity-50"
          onClick={open}
          disabled={!ready}
        >
          Connect Bank Account
        </button>
        <button
          className={`transition-all text-lg rounded-md shadow-md py-1 px-10 ${loading ? "bg-backgroundGray" : "bg-backgroundGrayLight"
            }`}
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? "Saving" : "Save"}
        </button>
      </div>
      {error && <p className="text-red-500 pt-2">{error}</p>}
    </Card>
  );
}
