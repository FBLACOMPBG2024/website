import { useEffect } from "react";
import router from "next/router";
import { showSuccess } from "@/utils/toast";

// This just redirects the user to the logout page
// It's a dummy component that does nothing but allow the user to logout

export default function LogoutView() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    showSuccess("Logging out...");
    router.push("/logout");
  }, []);

  // Just return an empty fragment
  return <></>;
}
