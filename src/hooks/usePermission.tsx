// usePermission.tsx - Hook for permission validation
import { useAuth } from "../context/AuthContext";

export const usePermission = (requiredPermission: string): boolean => {
  const { user } = useAuth();
  if (!user) return false;
  return user.permissions?.includes(requiredPermission);
};
