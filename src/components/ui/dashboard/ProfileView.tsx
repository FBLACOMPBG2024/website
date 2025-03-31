import { IUser } from "@/components/context/UserContext";
import { useTellerConnect } from "teller-connect-react";
import TextInput from "@/components/ui/TextInput";
import { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import Router from "next/router";
import api from "@/utils/api";

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
  const [theme, setTheme] = useState(user.preferences.theme);
  const [accountId, setAccountId] = useState(user.preferences.accountId);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { open, ready } = useTellerConnect({
    applicationId: "app_p8gs0depa90f4sgbou000",
    appearance: "dark",
    environment:
      process.env.NODE_ENV === "development" ? "sandbox" : "development", // This is a little weird but we don't have access to tellers production
    // environment but development is the same as production for teller (Just limited to 100 users)
    onSuccess: async (authorization) => {
      try {
        await api.post("/api/user/bank-connect", {
          accessToken: authorization.accessToken,
        });
        Router.reload();
      } catch (err) {
        console.error("Failed to connect bank account:", err);
        setError("Unable to connect bank account. Please try again.");
      }
    },
  });

  useEffect(() => {
    async function fetchBankAccounts() {
      if (!user.bankAccessToken) return;

      try {
        const response = await api.get("/api/user/bank/accounts");
        setBankAccounts(response.data);
      } catch (err) {
        console.error("Error fetching bank accounts:", err);
        setError("Unable to fetch bank accounts. Please try again.");
      }
    }

    fetchBankAccounts();
  }, [user.bankAccessToken]);

  const updateUserProfile = async () => {
    if (loading) return;

    setLoading(true);
    try {
      if (accountId !== user.preferences.accountId) {
        const confirmChange = window.confirm(
          "Changing your account will remove the current account's transactions. Proceed?"
        );

        if (!confirmChange) {
          setLoading(false);
          return;
        }

        await api.delete("/api/transaction/bulk-delete");
      }

      await api.post("/api/user/info", {
        firstName,
        lastName,
        email,
        preferences: { theme, accountId },
      });

      Router.reload();
    } catch (err) {
      console.error("Failed to update profile:", err);
      setError("Unable to save profile. Please try again.");
    } finally {
      setLoading(false);
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
          className={`transition-all text-lg rounded-md shadow-md py-1 px-10 ${
            loading ? "bg-backgroundGray" : "bg-backgroundGrayLight"
          }`}
          onClick={updateUserProfile}
          disabled={loading}
        >
          {loading ? "Saving" : "Save"}
        </button>
      </div>
      {error && <p className="text-red-500 pt-2">{error}</p>}
    </Card>
  );
}
