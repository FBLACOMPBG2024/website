import { NextApiRequest, NextApiResponse } from "next";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/utils/sessionConfig";
import { SessionData } from "@/utils/sessionData";
import axios from "axios";
import { ObjectId } from "mongodb";
import client from "@/lib/mongodb";
import https from "https";
import fs from "fs";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getIronSession<SessionData>(req, res, sessionOptions);

  // Ensure the user is authenticated
  if (!session.user?._id) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Fetch the user's Teller access token from the database
  const user = await client
    .db()
    .collection("users")
    .findOne({ _id: new ObjectId(session.user._id) });

  if (!user?.bankAccessToken) {
    return res.status(403).json({ message: "Bank access token not found" });
  }

  const accountId = user.preferences.accountId;

  if (!accountId || typeof accountId !== "string") {
    return res.status(400).json({
      message:
        "Account ID is required. Set a preferred account in the profile tab",
    });
  }

  try {
    // Ensure certificate and key paths are provided
    const certPath = process.env.CERT_PATH;
    const keyPath = process.env.KEY_PATH;

    if (!certPath || !keyPath) {
      return res.status(500).json({
        message: "Certificate or key path is not set in environment variables",
      });
    }

    const httpsAgent = new https.Agent({
      cert: fs.readFileSync(certPath, "utf8"),
      key: fs.readFileSync(keyPath, "utf8"),
    });

    // Make a request to the Teller API's transactions endpoint
    const tellerResponse = await axios.get(
      `https://api.teller.io/accounts/${accountId}/transactions`,
      {
        auth: {
          username: user.bankAccessToken,
          password: "", // Teller API requires only the token, so password can be empty
        },
        httpsAgent,
      }
    );

    console.log("Teller response:", tellerResponse.data);

    // Convert the transactions to our internal format
    const internalTransactions = tellerResponse.data.map(
      (transaction: any) => ({
        _id: new ObjectId(),
        bankId: transaction.id,
        date: new Date(transaction.date),
        value: parseFloat(transaction.amount),
        name: transaction.description,
        imported: true, // Mark the transaction as imported
        tags: [transaction.details?.category, transaction.type],
        userId: user._id,
        bankRunningBalance: parseFloat(transaction.running_balance),
      })
    );

    // Filter out transactions that already exist in the database
    const existingTransactionIds = (
      await client
        .db()
        .collection("transactions")
        .find({
          userId: user._id,
          bankId: { $in: internalTransactions.map((t: any) => t.bankId) },
        })
        .toArray()
    ).map((transaction: any) => transaction.bankId);

    // Filter out already existing transactions
    const newTransactions = internalTransactions.filter(
      (transaction: any) => !existingTransactionIds.includes(transaction.bankId)
    );

    // Insert only the new transactions
    if (newTransactions.length > 0) {
      await client.db().collection("transactions").insertMany(newTransactions);
    }

    // Add the new transaction IDs to the user's document if they don't already exist
    await client
      .db()
      .collection("users")
      .updateOne(
        { _id: new ObjectId(session.user._id) },
        {
          $addToSet: {
            transactions: {
              $each: newTransactions.map((transaction: any) => transaction._id),
            },
          },
        }
      );

    // Respond with the transactions data from the Teller API
    return res.status(200).json({
      message: "Synced transactions successfully",
      transactions: internalTransactions,
    });
  } catch (error: any) {
    // Log the error and provide more detailed error information
    console.error(
      "Error fetching transactions:",
      error.response?.data || error.message
    );
    const errorMessage =
      error?.response?.data?.message ||
      error?.message ||
      "Internal Server Error";

    return res.status(error.response?.status || 500).json({
      message: errorMessage,
    });
  }
}

export default handler;
