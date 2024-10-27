import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/Sidebar";
import Topbar from "@/components/ui/Topbar";
import { IconArrowLeft, IconBrandTabler, IconSettings, IconUser } from "@tabler/icons-react";
import { useState } from "react";
import Card from "@/components/ui/Card";
import { AnimatePresence, motion } from "framer-motion";
import { useUser } from "@/components/context/UserContext";
import api from "@/utils/api";

export default function Dashboard() {
    const [open, setOpen] = useState(false);
    const [selectedLink, setSelectedLink] = useState("Dashboard");
    const { user, setUser } = useUser();

    console.log(user);

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

    const changeBalance = () => {
    };

    const renderDashboard = () => {
        return <>
            <Card className="h-full w-full" >
                <h1 className="text-2xl font-bold text-text">Dashboard</h1>

                <motion.h1
                    key={user.balance}
                    initial={{ y: 0 }}
                    animate={{ y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    {user.balance.toLocaleString("en-US", { style: "currency", currency: "USD" }).split("").map((char, index) => (
                        <motion.span
                            key={index}
                            initial={{ opacity: 0, rotateX: 45 }}
                            animate={{ opacity: 1, rotateX: 0 }}
                            exit={{ opacity: 0, rotateX: -45 }}
                            transition={{ duration: 0.2, delay: index * 0.1 }}
                        >
                            {char}
                        </motion.span>
                    ))}
                </motion.h1>
                <button
                    onClick={changeBalance}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
                >
                    Change Balance
                </button>
            </Card >
        </>;
    };

    const renderProfile = () => {
        return <>
            <Card className="h-full w-full" >
                <h1 className="text-2xl font-bold text-text">Profile</h1>
                <p>{user.email}</p>
                <p>{user.firstName} {user.lastName}</p>

            </Card>
        </>;
    };

    const renderSettings = () => {
        return <>
            <Card className="h-full w-full" >
                <h1 className="text-2xl font-bold text-text">Settings</h1>

            </Card>
        </>;
    };

    const renderLogout = () => {
        return <>
            <Card className="h-full w-full" >
                <h1 className="text-2xl font-bold text-text">Log out</h1>

            </Card>
        </>;
    };

    const renderContent = () => {
        switch (selectedLink) {
            case "Dashboard":
                return renderDashboard();
            case "Profile":
                return renderProfile();
            case "Settings":
                return renderSettings();
            case "Logout":
                return renderLogout();
            default:
                return renderDashboard();
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
                    <AnimatePresence mode='wait'>
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