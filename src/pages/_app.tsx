import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Inter } from 'next/font/google';
import Topbar from "@/components/topbar";

// Load the Inter font with the Latin subset (The only one our site will require)
const inter = Inter({ subsets: ['latin'] });

// Define the App component
// Import our font and apply it to the main element
export default function App({ Component, pageProps }: AppProps) {
  return (
    <main className={inter.className}>
      <Component {...pageProps} />
    </main>
  )
}
