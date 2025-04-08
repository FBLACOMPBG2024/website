import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Inter } from "next/font/google";
import { useEffect, useState } from "react";
import { IUser, UserProvider } from "@/components/context/UserContext";
import api from "@/utils/api";
import { GoogleOAuthProvider } from "@react-oauth/google";
import PropagateLoader from "react-spinners/PropagateLoader";
import { ToastContainer } from 'react-toastify';
import Head from "next/head";
// Load the Inter font with the Latin subset (The only one our site will require)
const inter = Inter({ subsets: ["latin"] });

// Define the App component
// Import our font and apply it to the main element
export default function App({
  Component,
  pageProps: { ...pageProps },
}: AppProps) {
  const [user, setUser] = useState<IUser>(null as unknown as IUser);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const infoResponse = async () => {
      try {
        const response = await api.get("api/user/info");
        if (response?.status === 200) {
          setUser(response.data.user);
        }
      } catch (error: any) {
        if (error.response?.status !== 401) {
          console.error(error);
        }
        // else: silently ignore 401
      } finally {
        setLoading(false);
      }
    };


    if (!user) {
      infoResponse();
      return;
    }

    if (!user.preferences) {
      // This should almost never happen but just in case
      setLoading(false);
      return;
    }

    if (user.preferences.theme !== "system") {
      // If the user has a theme set, apply it
      document.body.classList.add(user.preferences.theme);
    }
  }, [user]);

  return (
    <>
      <Head>
        <title>Smart Spend</title>
        <meta name="description" content="Smart Spend" />
      </Head>

      {loading ? (
        <main className={inter.className}>
          <div className="w-full h-screen flex items-center justify-center">
            <PropagateLoader color="rgb(var(--primary))" />
          </div>
        </main>
      ) : (
        <GoogleOAuthProvider clientId="50088023361-h8voq3f3kv7941obpmvjsckjcuqt2der.apps.googleusercontent.com">
          <UserProvider value={{ user, setUser }}>
            <main className={inter.className}>
              <Component {...pageProps} />
              <ToastContainer />
            </main>
          </UserProvider>
        </GoogleOAuthProvider>
      )}
    </>
  );
}
