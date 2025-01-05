import { NextApiRequest, NextApiResponse } from "next";
import client from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/utils/sessionConfig";

// This endpoint updates user information and handles session refresh
async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getIronSession(req, res, sessionOptions);

  // Ensure the user is authenticated
  if (!session.user?._id) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const userId = session.user._id;

  // Fetch the user from the database
  const user = await client
    .db()
    .collection("users")
    .findOne({
      _id: new ObjectId(userId),
    });

  if (!user || !user._id) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    // Check if the session is close to expiring and refresh it if necessary
    if (isSessionExpiring(session)) {
      await refreshSession(session, user); // Pass user to refreshSession
    }

    // Handle different request methods (POST for update, GET for fetch)
    if (req.method === "POST") {
      return await updateUser(req, res, user);
    }

    if (req.method === "GET") {
      return await getUserInfo(res, user);
    }

    // Handle unsupported methods
    res.setHeader("Allow", ["POST", "GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

// Helper function to update user information
async function updateUser(
  req: NextApiRequest,
  res: NextApiResponse,
  user: any,
) {
  const { firstName, lastName, email } = req.body;

  // Validate email format
  if (email && !validateEmail(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  // Prepare fields to update
  const updatedFields: any = {};
  if (firstName) updatedFields.firstName = firstName;
  if (lastName) updatedFields.lastName = lastName;
  if (email) updatedFields.email = email;

  if (Object.keys(updatedFields).length === 0) {
    return res.status(400).json({ message: "No fields provided to update" });
  }

  // Update the user in the database
  await client
    .db()
    .collection("users")
    .updateOne(
      { _id: new ObjectId(user._id) },
      {
        $set: updatedFields,
      },
    );

  return res.status(200).json({ message: "User updated successfully" });
}

// Helper function to get user information
async function getUserInfo(res: NextApiResponse, user: any) {
  // Check if the user's email is verified
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
    },
  });
}

// Helper function to validate email format
function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Check if the session is close to expiring (e.g., 5 minutes before expiration)
function isSessionExpiring(session: any): boolean {
  const currentTime = Date.now();
  const sessionExpirationTime = session._expires || 0;
  return sessionExpirationTime - currentTime < 5 * 60 * 1000; // 5 minutes before expiration
}

// Refresh the session by extending the expiration time and update the user balance
async function refreshSession(session: any, user: any) {
  // Get all transactions for the user
  const transactions = await client
    .db()
    .collection("transactions")
    .find({ userId: user._id })
    .toArray();

  // Calculate the balance
  const balance = transactions.reduce(
    (acc, transaction) => acc + transaction.value,
    0,
  );

  // Update user balance in the database
  await client
    .db()
    .collection("users")
    .updateOne({ _id: user._id }, { $set: { balance: balance } });

  // Update the session with the new balance
  session.user = {
    ...session.user,
    balance,
  };
  await session.save(); // Save the updated session

  return balance; // Return the updated balance
}

export default handler;
