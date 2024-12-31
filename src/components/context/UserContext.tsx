import { useContext, createContext, ReactNode } from "react";

// This file defines the UserContext, which is used to store the user data
// and provide it to the rest of the application.

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
  user: IUser;
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
    balance: 1337,
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setUser(user: IUser): void {},
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
