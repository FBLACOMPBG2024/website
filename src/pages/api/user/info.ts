import { NextApiRequest, NextApiResponse } from "next";
import client from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/utils/sessionConfig";
import { SessionData } from "@/utils/sessionData";
import api from "@/utils/api";
import { showError } from "@/utils/toast";

// Helper function to validate email format
const validateEmail = (email: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// Helper function to check if the session is close to expiring
const isSessionExpiring = (session: any): boolean => {
  const currentTime = Date.now();
  const sessionExpirationTime = session._expires || 0;
  return sessionExpirationTime - currentTime < 5 * 60 * 1000; // 5 minutes before expiration
};

// Helper function to refresh the session
const refreshSession = async (session: any, user: any) => {
  // If we have a bank access token, we can grab the balance from the database
  if (user.bankAccessToken && user.preferences?.accountId) {
    // Send a get request to the Teller API to get the user's balance
    // /accounts/:account_id/balances
    const accountId = user.preferences.accountId;
    if (!accountId || typeof accountId !== "string") {
      throw new Error(
        "Account ID is required. Set a preferred account in the profile tab"
      );
    }

    try {

      const tellerResponse = await api.get(
        `https://api.teller.io/accounts/${accountId}/balances`,
        {
          auth: {
            username: user.bankAccessToken,
            password: "", // Teller API requires only the token, so password can be empty
          },
        }
      );

      if (tellerResponse.status !== 200) {
        throw new Error("Failed to fetch account balances");
      }

      const balances = tellerResponse.data;
      if (!balances) {
        throw new Error("No balances found");
      }
      const balance = balances.available || 0;

      // Convert the balance to a number
      const parsedBalance = parseFloat(balance);
      if (isNaN(parsedBalance)) {
        throw new Error("Invalid balance format");
      }

      // Update the user's balance in the database
      await client
        .db()
        .collection("users")
        .updateOne({ _id: user._id }, { $set: { balance } });
      // Update the session with the new balance
      session.user = { ...session.user, balance };
      await session.save();
      return balance;
    } catch (e) {
      console.log(e);
      showError("An error occured getting your balance, To fix this set a preferred account in your profile settings");
    }

  }

  const transactions = await client
    .db()
    .collection("transactions")
    .find({ userId: user._id })
    .toArray();

  const balance = transactions.reduce(
    (acc, transaction) => acc + transaction.value,
    0
  );

  await client
    .db()
    .collection("users")
    .updateOne({ _id: user._id }, { $set: { balance } });

  session.user = { ...session.user, balance };
  await session.save();

  return balance;
};

// Helper function to update user information
const updateUser = async (
  req: NextApiRequest,
  res: NextApiResponse,
  user: any
) => {
  const { firstName, lastName, email, preferences } = req.body;

  if (email && !validateEmail(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  const updatedFields: any = {};
  if (firstName) updatedFields.firstName = firstName;
  if (lastName) updatedFields.lastName = lastName;
  if (email) updatedFields.email = email;
  if (preferences) updatedFields.preferences = preferences;

  if (Object.keys(updatedFields).length === 0) {
    return res.status(400).json({ message: "No fields provided to update" });
  }


  await client
    .db()
    .collection("users")
    .updateOne({ _id: new ObjectId(user._id) }, { $set: updatedFields });

  return res.status(200).json({ message: "User updated successfully" });
};

// Helper function to get user information
const getUserInfo = (res: NextApiResponse, user: any) => {
  if (!user.emailVerified) {
    return res.status(401).json({ message: "Awaiting email verification" });
  }

  return res.status(200).json({
    message: "User information fetched",
    user: {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      balance: user.balance,
      bankAccessToken: user.bankAccessToken,
      preferences: user.preferences,
    },
  });
};

// Main API handler function
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getIronSession<SessionData>(req, res, sessionOptions);

  if (!session.user?._id) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const userId = session.user._id;

  const user = await client
    .db()
    .collection("users")
    .findOne({ _id: new ObjectId(userId) });

  if (!user || !user._id) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    // Refresh session if it's close to expiring
    if (isSessionExpiring(session)) {
      await refreshSession(session, user);
    }

    // Handle different request methods
    if (req.method === "POST") {
      return await updateUser(req, res, user);
    }

    if (req.method === "GET") {
      return await getUserInfo(res, user);
    }

    res.setHeader("Allow", ["POST", "GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export default handler;
