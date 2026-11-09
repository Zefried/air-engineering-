import { createContext } from "react";

export type Role = "admin" | "manager" | "subadmin" | "technician" | "worker" | "department" | (string & {});

export type User = {
  id: number;
  name: string;
  email: string;
  role: Role;
};

export type AuthContextType = {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextType | null>(null);
