import { useContext, createContext, ReactNode } from "react";

export interface IUser {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    createdAt: Date;
    emailVerified: boolean;
}

interface IUserContext {
    user: IUser,
    setUser(user: IUser): void;
}

const defaultvalues: IUserContext = {
    user: {
        _id: "",
        firstName: "",
        lastName: "",
        email: "",
        createdAt: new Date(),
        emailVerified: false,
    },
    setUser(user: IUser): void { },
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