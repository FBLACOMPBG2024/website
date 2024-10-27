import { useContext, createContext, ReactNode } from "react";

export interface IUser {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    createdAt: Date;
    emailVerified: boolean;
    balance: number;
}

interface IUserContext {
    user: IUser,
    setUser(user: any): void;
}

const defaultvalues: IUserContext = {
    user: {
        _id: "",
        firstName: "",
        lastName: "",
        email: "",
        createdAt: new Date(),
        emailVerified: false,
        balance: 1337,
    },
    setUser(user: any): void { },
};

const UserContext = createContext(defaultvalues);

export const UserProvider = ({
    value,
    children,
}: {
    value: IUserContext;
    children: ReactNode;
}) => {
    return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => useContext<IUserContext>(UserContext);