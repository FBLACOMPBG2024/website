import { MongoClient } from "mongodb";
import type { MongoClientOptions } from "mongodb";

// This file connects to MongoDB using the connection string
// provided in the MONGODB_URI environment variable.
// This file was taken from the authjs documentation here: https://authjs.dev/getting-started/adapters/mongodb

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

const uri = process.env.MONGODB_URI;

const options: MongoClientOptions = {
  // Use ipv4 for local connections
  family: 4,
};

let client: MongoClient;

if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  const globalWithMongo = global as typeof globalThis & {
    _mongoClient?: MongoClient;
  };

  if (!globalWithMongo._mongoClient) {
    globalWithMongo._mongoClient = new MongoClient(uri, options);
  }
  client = globalWithMongo._mongoClient;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options);
}

client
  .connect()
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err: Error) => {
    console.error(err);
  });

// Export a module-scoped MongoClient. By doing this in a
// separate module, the client can be shared across functions.
export default client;
