import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/Sidebar";
import Topbar from "@/components/ui/Topbar";
import {
  IconArrowLeft,
  IconArrowsRightLeft,
  IconBrandTabler,
  IconHelp,
  IconTargetArrow,
  IconUser,
} from "@tabler/icons-react";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useUser } from "@/components/context/UserContext";
import api from "@/utils/api";
import DashboardView from "@/components/ui/dashboard/DashboardView";
import ProfileView from "@/components/ui/dashboard/ProfileView";
import LogoutView from "@/components/ui/dashboard/LogoutView";
import router from "next/router";
import TransactionsView from "@/components/ui/dashboard/TransactionsView";
import HelpView from "@/components/ui/dashboard/HelpView";
import { showError } from "@/utils/toast";

export default function Dashboard() {
  const [open, setOpen] = useState(false);
  const [selectedLink, setSelectedLink] = useState("");
  const { user, setUser } = useUser();

  const links = [
    {
      label: "Dashboard",
      href: "",
      icon: <IconBrandTabler className="text-text h-5 w-5 flex-shrink-0" />,
    },
    {
      label: "Transactions",
      href: "#transactions",
      icon: <IconArrowsRightLeft className="text-text h-5 w-5 flex-shrink-0" />,
    },
    {
      label: "Profile",
      href: "#profile",
      icon: <IconUser className="text-text h-5 w-5 flex-shrink-0" />,
    },
    // {
    //   label: "Goals",
    //   href: "#goals",
    //   icon: <IconTargetArrow className="text-text h-5 w-5 flex-shrink-0" />,
    // },
    // {
    //   label: "Settings",
    //   href: "#settings",
    //   icon: <IconSettings className="text-text h-5 w-5 flex-shrink-0" />,
    // },
    {
      label: "Help",
      href: "#help",
      icon: <IconHelp className="text-text h-5 w-5 flex-shrink-0" />,
    },
    {
      label: "Logout",
      href: "#logout",
      icon: <IconArrowLeft className="text-text h-5 w-5 flex-shrink-0" />,
    },
  ];

  useEffect(() => {
    const hash = window.location.hash;
    const link = links.find((link) => link.href === hash);
    if (link) {
      setSelectedLink(link.label);
    }
  }, [links]);

  if (!user) {
    showError("No user found, You will have to sign in again");
    router.push("/login");
    return;
  }

  const renderContent = () => {
    switch (selectedLink) {
      case "Dashboard":
        console.log(selectedLink);
        return <DashboardView user={user} />;
      case "Transactions":
        return <TransactionsView />;
      case "Profile":
        return <ProfileView user={user} />;
      // case "Settings":
      //   return <SettingsView />;
      //case "Goals":
      //  return <GoalView user={user} />;
      case "Help":
        return <HelpView user={user} />;
      case "Logout":
        return <LogoutView />;
      default:
        return <></>;
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-x-auto">
      {/* Topbar */}
      <Topbar />
      {/* Gradient background that fills the remaining screen space */}
      <div className="flex-1 bg-background flex flex-col md:flex-row ">
        <Sidebar open={open} setOpen={setOpen} animate={true}>
          <SidebarBody className="justify-between gap-10">
            <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
              <div className="mt-8 flex flex-col gap-2">
                {links.map((link, idx) => (
                  <SidebarLink
                    key={idx}
                    link={link}
                    onClick={async () => {
                      setSelectedLink(link.label);

                      try {
                        const response = await api.get("api/user/info");
                        if (response.status === 200) {
                          setUser(response.data.user);
                        }
                      } catch (error) {
                        // It's fine if this fails
                        console.error(error);
                      }
                    }}
                  />
                ))}
              </div>
            </div>
          </SidebarBody>
        </Sidebar>

        <div className="h-full w-full p-4">
          <AnimatePresence mode="popLayout">
            <motion.div
              key={selectedLink}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 1 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
