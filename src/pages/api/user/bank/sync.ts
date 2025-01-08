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
        "Account ID is required, Set a preferred account in the profile tab",
    });
  }

  try {
    const httpsAgent = new https.Agent({
      cert: fs.readFileSync(process.env.CERT_PATH || "", "utf8"),
      key: fs.readFileSync(process.env.KEY_PATH || "", "utf8"),
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
        value: Number.parseFloat(transaction.amount),
        name: transaction.description,
        imported: true, // Mark the transaction as imported
        tags: [transaction.details?.category, transaction.type],
        userId: user._id,
        bankRunningBalance: Number.parseFloat(transaction.running_balance),
      })
    );
    // Filter out transactions that already exist in the database
    const existingTransactionIds = (
      await client
        .db()
        .collection("transactions")
        .find({
          userId: user._id,
          bankId: {
            $in: internalTransactions.map(
              (transaction: any) => transaction.bankId
            ),
          },
        })
        .toArray()
    ).map((transaction: any) => transaction.bankId);

    // Filter internalTransactions to exclude the ones that already exist
    const newTransactions = internalTransactions.filter(
      (transaction: any) => !existingTransactionIds.includes(transaction.bankId)
    );

    // Insert only the new transactions that don't already exist in the database
    if (newTransactions.length > 0) {
      await client.db().collection("transactions").insertMany(newTransactions);
    }

    // Add the new transaction IDs to the user's document if they don't already exist
    await client
      .db()
      .collection("users") // Add the correct type here
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
    console.error(
      "Error fetching transactions:",
      error.response?.data || error.message
    );
    return res.status(error.response?.status || 500).json({
      message: error?.message || "Internal Server Error",
    });
  }
}

export default handler;
