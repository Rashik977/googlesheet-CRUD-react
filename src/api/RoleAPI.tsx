// api/RoleAPI.ts
import { API_URL } from "@/config";
import api from "./api";

export const getUserRole = async (email: string) => {
  const response = await api.get(API_URL, {
    params: {
      module: "role",
      email,
    },
  });

  if (response.data.error) {
    throw new Error(response.data.error);
  }

  return response.data; // { email, role, permissions }
};
