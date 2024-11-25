import { User } from "./IUser";

export interface AuthContextType {
  user: User;
  login: (userData: User) => void;
  logout: () => void;
  loading: boolean;
}
