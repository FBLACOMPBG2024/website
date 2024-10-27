import { useRouter } from "next/router";
import api from "@/utils/api";
import { useEffect } from "react";
import { IUser, useUser } from "@/components/context/UserContext";

export default function SignOut() {
    const router = useRouter();

    const { setUser } = useUser();

    setUser({} as IUser);

    api.post("/api/auth/sign-out").then(() => {
        router.push("/");
    });

    useEffect(() => {
        router.push("/");
    }, []);

    return (
        <></>
    );
}
