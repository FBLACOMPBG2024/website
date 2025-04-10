import { useContext, createContext, ReactNode } from "react";

// Context provider for managing and sharing user data across the app

export interface IUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: Date;
  emailVerified: boolean;
  balance: number;
  bankAccessToken?: string;
  preferences: {
    theme: string;
    accountId: string;
  };
}

interface IUserContext {
  user: IUser;
  setUser(user: IUser): void;
}

const defaultValues: IUserContext = {
  user: {
    _id: "",
    firstName: "",
    lastName: "",
    email: "",
    createdAt: new Date(),
    emailVerified: false,
    balance: 1337,
    bankAccessToken: "",
    preferences: {
      theme: "system",
      accountId: "",
    },
  },
  setUser: (user: IUser) => {
    // Placeholder setter – this should be overridden by the provider
    console.warn("setUser called outside of UserProvider");
  },
};

const UserContext = createContext(defaultValues);

// Wraps children with the UserContext provider to pass down user state
export const UserProvider = ({
  value,
  children,
}: {
  value: IUserContext;
  children: ReactNode;
}) => {
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

// Hook to access the user context
export const useUser = () => useContext<IUserContext>(UserContext);
