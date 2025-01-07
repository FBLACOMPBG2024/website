import { Html, Head, Main, NextScript } from "next/document";
import { IconGraph } from "@tabler/icons-react"; // Import the Tabler icon

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="icon" type="image/svg+xml" href="/graph.svg" />
        <link rel="manifest" href="/manifest.json" />
      </Head>
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
