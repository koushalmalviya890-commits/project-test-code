"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
// Import shared types if possible, or define locally
interface User {
  id: string;
  email: string;
  name: string;
  userType?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  update: (data: Partial<User>) => void; // New function definition
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== "undefined") {
      const savedUser = sessionStorage.getItem("authUser");
      return savedUser ? JSON.parse(savedUser) : null;
    }
    return null;
  });
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const apiUrl = "http://localhost:3001";

  useEffect(() => {
    const checkUser = async () => {
      try {
        // ✅ Must be the absolute Express URL
        const { data } = await axios.get(`${apiUrl}/api/auth/me`, {
          withCredentials: true, // ✅ Critical for persistence
        });
        setUser(data.user);
        sessionStorage.setItem("authUser", JSON.stringify(data.user));
      } catch (error) {
        setUser(null); // Clear session if token is invalid/expired
        sessionStorage.removeItem("authUser");
      } finally {
        setLoading(false);
      }
    };
    checkUser();
  }, []);

  const login = async (credentials: any) => {
    const { data } = await axios.post(`${apiUrl}/api/auth/login`, credentials, {
      withCredentials: true,
    });
    setUser(data.user);
    sessionStorage.setItem("authUser", JSON.stringify(data.user));

    if (!data.user.userType) router.push("/auth/choose-account-type");
    else
      router.push(
        data.user.userType === "startup"
          ? "/startup/dashboard"
          : "/service-provider/dashboard",
      );
  };

  const logout = async () => {
    await axios.post(
      `${apiUrl}/api/auth/logout`,
      {},
      { withCredentials: true },
    );
    setUser(null);
    router.push("/sign-in");
  };
  const update = (newData: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return null;
      return { ...prev, ...newData };
    });
  };
  return (
    <AuthContext.Provider value={{ user, loading, login, logout, update }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
