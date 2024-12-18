import { AuthContextType } from "@/interfaces/IAuthContextType";
import { User } from "@/interfaces/IUser";
import { createContext, useState, useContext, useEffect } from "react";

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Error reading from localStorage:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (userData: User) => {
    try {
      const payload = {
        email: userData.email,
        exp: Date.now() + 3600 * 1000, // 1 hour expiry
      };
      const token = btoa(JSON.stringify(payload));
      localStorage.setItem("authToken", token);
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  if (loading) {
    return <div>Loading...</div>; // Or your custom loading component
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
