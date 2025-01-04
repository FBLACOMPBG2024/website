import { SessionOptions } from "iron-session";

export const sessionOptions: SessionOptions = {
    password: process.env.IRON_SESSION_PASSWORD!,
    cookieName: "user_session",
    cookieOptions: {
      secure: process.env.NODE_ENV === "production",
    },
  };
