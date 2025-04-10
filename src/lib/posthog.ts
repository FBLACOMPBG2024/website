import { PostHog } from "posthog-node";

// Creates and returns a configured PostHog client for analytics tracking

export default function createPostHogClient() {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;

  if (!key) {
    throw new Error("PostHog key is missing in environment variables");
  }

  const posthogClient = new PostHog(key, {
    host: "https://us.i.posthog.com", // US-based PostHog instance
    flushAt: 1, // Send events immediately
    flushInterval: 0, // Disable batching interval
  });

  return posthogClient;
}
