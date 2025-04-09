import { PostHog } from "posthog-node";

const posthog = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY || "", {
  host: process.env.POSTHOG_HOST || "https://app.posthog.com",
});

// Safe capture wrapper
export const captureEvent = async (
  event: string = "",
  properties: Record<string, any>
) => {
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;

  posthog.capture({
    distinctId: "backend",
    event,
    properties,
  });

  console.log(
    new Date().toDateString() + " Event captured:",
    event,
    properties
  );
};

export default posthog;
