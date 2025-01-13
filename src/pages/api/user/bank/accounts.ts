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

  try {
    // Check if certificate and key paths are available
    const certPath = process.env.CERT_PATH;
    const keyPath = process.env.KEY_PATH;

    if (!certPath || !keyPath) {
      return res.status(500).json({
        message: "Certificate or key path not set in environment variables",
      });
    }

    const httpsAgent = new https.Agent({
      cert: fs.readFileSync(certPath, "utf8"),
      key: fs.readFileSync(keyPath, "utf8"),
    });

    // Make a request to the Teller API's accounts endpoint
    const tellerResponse = await axios.get("https://api.teller.io/accounts", {
      auth: {
        username: user.bankAccessToken,
        password: "", // Teller API requires only the token, so password can be empty
      },
      httpsAgent,
    });

    // Respond with the accounts data from the Teller API
    return res.status(200).json(tellerResponse.data);
  } catch (error: any) {
    console.error(
      "Error fetching account:",
      error.response?.data || error.message
    );

    if (error.response) {
      // If it's an error from the API, return that specific status and message
      return res.status(error.response.status).json({
        message: error.response.data.message || "Error fetching account",
      });
    }

    // Handle case for network issues or unexpected errors
    return res.status(500).json({
      message: error.message || "Internal Server Error",
    });
  }
}

export default handler;
