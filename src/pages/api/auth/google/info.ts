import { NextApiRequest, NextApiResponse } from "next";
import api from "@/utils/api";
import Cors from "cors";

// This file defines the API route that allows the user to get their profile information from Google
// It uses the Google OAuth2 API to get the user's information

// The below code is the CORS middleware
// To be quite honest I'm not sure what it does and I struggle to understand it (As far as I know it isn't necessary for the code to work)
// But until I understand it I'm going to leave it in the code

// // Initialize CORS middleware
// const cors = Cors({
//   methods: ["GET", "POST", "OPTIONS"],
//   origin: "*", // You can specify your front-end URL here to restrict which origins are allowed
// });

// // Helper function to run CORS middleware
// const runCors = (req: NextApiRequest, res: NextApiResponse) =>
//   new Promise((resolve, reject) => {
//     cors(req, res, (result: any) => {
//       if (result instanceof Error) {
//         reject(result);
//       } else {
//         resolve(result);
//       }
//     });
//   });

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // Run CORS middleware
  // try {
  //   await runCors(req, res);
  // } catch (error: any) {
  //   return res
  //     .status(500)
  //     .json({ message: "CORS Error", error: error.message });
  // }

  if (req.method === "GET") {
    const access_token = req.query.access_token;

    // Check if the access token is present
    if (!access_token) {
      res.status(400).json({ message: "No access token" });
    }

    try {
      // Get the user's information from Google
      const userInfo = await api
        .get("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${access_token}` },
        })
        .then((res) => res.data);

      // Return the user's information
      res.status(200).json(userInfo);
    } catch (error: any) {
      // Log the error and return an error message
      console.error(error);
      return res.status(500).json({ message: "Invalid Credentials" });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
