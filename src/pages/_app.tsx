import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Inter } from 'next/font/google';
import { useEffect, useState } from "react";
import { IUser, UserProvider } from "@/components/context/UserContext";
import api from "@/utils/api";
import { GoogleOAuthProvider } from '@react-oauth/google';
import PropagateLoader from "react-spinners/PropagateLoader";
// Load the Inter font with the Latin subset (The only one our site will require)
const inter = Inter({ subsets: ['latin'] });

// Define the App component
// Import our font and apply it to the main element
export default function App({ Component, pageProps: { ...pageProps } }: AppProps) {
  const [user, setUser] = useState<IUser>(null as unknown as IUser);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const refreshResponse = async () => {
      try {
        const response = await api.get("api/auth/refresh");
        if (response?.status == 200) {
          setUser(response.data.user);
        }
      } catch (error) {
        console.error(error);
      }
      setLoading(false);
    }

    if (!user) refreshResponse()
  }, [user]);

  return (
    loading ?
      <>
        <main className={inter.className}>
          <div className="w-full h-screen flex items-center justify-center">
            <PropagateLoader
              height="10vh"
              color="rgb(var(--primary))"
            />
          </div>
        </main>
      </> :
      <GoogleOAuthProvider clientId="50088023361-h8voq3f3kv7941obpmvjsckjcuqt2der.apps.googleusercontent.com">
        <UserProvider value={{ user, setUser }}>
          <main className={inter.className}>
            <Component {...pageProps} />
          </main>
        </UserProvider>
      </GoogleOAuthProvider>
  )
}