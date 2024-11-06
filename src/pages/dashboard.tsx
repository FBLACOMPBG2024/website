import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/Sidebar";
import Topbar from "@/components/ui/Topbar";
import { IconArrowLeft, IconBrandTabler, IconSettings, IconUser } from "@tabler/icons-react";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useUser } from "@/components/context/UserContext";
import api from "@/utils/api";
import DashboardView from "@/components/ui/dashboard/DashboardView";
import ProfileView from "@/components/ui/dashboard/ProfileView";
import SettingsView from "@/components/ui/dashboard/SettingsView";
import LogoutView from "@/components/ui/dashboard/LogoutView";
import router from "next/router";

export default function Dashboard() {
    const [open, setOpen] = useState(false);
    const [selectedLink, setSelectedLink] = useState("Dashboard");
    const { user, setUser } = useUser();

    if (!user) {
        router.push("/login");
        return;
    }

    const links = [
        {
            label: "Dashboard",
            href: "",
            icon: (
                <IconBrandTabler className="text-text h-5 w-5 flex-shrink-0" />
            ),
        },
        {
            label: "Profile",
            href: "#profile",
            icon: (
                <IconUser className="text-text h-5 w-5 flex-shrink-0" />
            ),
        },
        {
            label: "Settings",
            href: "#settings",
            icon: (
                <IconSettings className="text-text h-5 w-5 flex-shrink-0" />
            ),
        },
        {
            label: "Logout",
            href: "#logout",
            icon: (
                <IconArrowLeft className="text-text h-5 w-5 flex-shrink-0" />
            ),
        },
    ];

    const renderContent = () => {
        switch (selectedLink) {
            case "Dashboard":
                return <DashboardView user={user} />;
            case "Profile":
                return <ProfileView user={user} />;
            case "Settings":
                return <SettingsView />;
            case "Logout":
                return <LogoutView />;
            default:
                return <DashboardView user={user} />;
        }
    };

    return (
        <div className="flex flex-col h-screen w-screen">
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
                                                const response = await api.get("api/auth/refresh");
                                                if (response.status == 200) {
                                                    setUser(response.data.user);
                                                }
                                            } catch (error) {
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
                    <AnimatePresence mode='popLayout'>
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