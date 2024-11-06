import router, { useRouter } from "next/router";
import api from "@/utils/api";
import { useEffect } from "react";
import { IUser, useUser } from "@/components/context/UserContext";

export default function SignOut() {
    const router = useRouter();
    const { setUser } = useUser();

    useEffect(() => {
        const logout = async () => {
            await api.post("/api/auth/logout");
            setUser(null);
            router.push("/login");
        };
        logout();
    }, []);

    return (
        <>
            <div>
                Loading...
            </div>
        </>
    );
}
