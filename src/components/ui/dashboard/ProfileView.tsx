import { IUser } from "@/components/context/UserContext";
import TextInput from "@/components/ui/TextInput";
import Card from "@/components/ui/Card";
import { useState } from "react";
import Router from "next/router";
import api from "@/utils/api";
import { useTellerConnect } from "teller-connect-react";
import { useEffect } from "react";

// This is the profile view component
// It allows the user to view and update their profile information

interface ProfileViewProps {
  user: IUser;
}

export default function ProfileView({ user }: ProfileViewProps) {
  // Hold the user's updated information
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [email, setEmail] = useState(user.email);
  const [theme, setTheme] = useState(user.preferences.theme);
  const [accountId, setAccountId] = useState(user.preferences.accountId);
  interface BankAccount {
    id: string;
    name: string;
  }

  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);

  // Initialize Teller Connect
  const { open, ready } = useTellerConnect({
    applicationId: "app_p8gs0depa90f4sgbou000",
    appearance: "dark",
    environment:
      process.env.NODE_ENV === "development" ? "sandbox" : "development",
    onSuccess: (authorization) => {
      console.log("Authorization success:", authorization);
      // Handle the access token (e.g., send it to your API for storage)
      api.post("/api/user/bank-connect", {
        accessToken: authorization.accessToken,
      });
    },
  });

  // Use effect to get the user's accounts
  useEffect(() => {
    async function getAccounts() {
      if (user.bankAccessToken === "" || user.bankAccessToken === null) {
        return;
      }

      const response = await api.get("/api/user/bank/accounts");
      if (response.status === 200) {
        setBankAccounts(response.data);
      }
    }

    if (user.preferences.accountId !== "") {
      setAccountId(user.preferences.accountId);
    }

    getAccounts();
  }, []); // Empty dependency array ensures it runs only once when the component mounts

  // Make a function to update the user's profile
  async function updateUserProfile() {
    // Make a POST request to the API updating the user's information
    const response = await api.post("/api/user/info", {
      firstName,
      lastName,
      email,
      preferences: {
        theme,
        accountId,
      },
    });

    // If the response is successful, update the user context by reloading the page
    if (response.status === 200) {
      //Router.reload();
    }
  }

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
      <div className="">
        <h2 className="text-lg font-bold text-text">Theme</h2>
        <select
          className="bg-backgroundGrayLight border-none focus:text-white selection:bg-primary text-neutral-500 h-8 text-base rounded-md marker"
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
        >
          <option value="system">System</option>
          <option value="dark">Dark</option>
          <option value="light">Light</option>
        </select>
      </div>
      <div className="">
        <h2 className="text-lg font-bold text-text">Account</h2>
        <select
          className="bg-backgroundGrayLight border-none focus:text-white selection:bg-primary text-neutral-500 h-8 text-base rounded-md marker"
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
      <div className="pt-2 flex flex-row justify-between items-center">
        {/* Teller Connect Button */}
        <button
          className="text-lg bg-primary text-white rounded-md shadow-md py-1 px-10 disabled:opacity-40"
          onClick={() => open()}
          disabled={!ready}
        >
          Connect a Bank Account
        </button>
        {/* Save Button */}
        <button
          className="text-lg bg-backgroundGrayLight rounded-md shadow-md py-1 px-10"
          onClick={() => updateUserProfile()}
        >
          Save
        </button>
      </div>
    </Card>
  );
}
