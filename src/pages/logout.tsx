import { useRouter } from "next/router";
import api from "@/utils/api";
import { useEffect } from "react";
import { IUser, useUser } from "@/components/context/UserContext";

export default async function SignOut() {

    useEffect(() => {

    }, [api]);

    return (
        <>
            <div>
                Loading...
            </div>
        </>
    );
}
