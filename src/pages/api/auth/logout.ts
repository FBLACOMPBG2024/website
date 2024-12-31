import { NextApiRequest, NextApiResponse } from "next";
import cookie from "cookie";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === "POST") {
    // Empty the token cookie
    res.setHeader(
      "Set-Cookie",
      cookie.serialize("token", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 0,
        sameSite: "strict",
        path: "/",
      }),
    );

    // Return a success message
    res.status(200).json({ message: "Signed out" });
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
