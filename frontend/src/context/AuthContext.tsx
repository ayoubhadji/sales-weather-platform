import {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";

import type { ReactNode } from "react";

import authService from "../services/authService";

/*
|--------------------------------------------------------------------------
| User Interface
|--------------------------------------------------------------------------
| Represents the authenticated user returned by the backend.
*/
interface User {
  id: number;
  name: string;
  email: string;
  role: "ADMIN" | "FRANCHISE";
}

/*
|--------------------------------------------------------------------------
| Context Interface
|--------------------------------------------------------------------------
| Defines everything that can be accessed through useAuth().
*/
interface AuthContextType {
  user: User | null;

  login: (user: User) => void;

  logout: () => void;

  isAuthenticated: boolean;

  // Prevents redirecting before checking localStorage
  loading: boolean;
}

/*
|--------------------------------------------------------------------------
| Create Context
|--------------------------------------------------------------------------
*/
const AuthContext = createContext<AuthContextType>(
  {} as AuthContextType
);

/*
|--------------------------------------------------------------------------
| Auth Provider
|--------------------------------------------------------------------------
| Wraps the entire application.
| Responsible for keeping authentication state.
*/
export const AuthProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  // Logged-in user
  const [user, setUser] = useState<User | null>(null);

  // True while checking if a previous session exists
  const [loading, setLoading] = useState(true);

  /*
  |--------------------------------------------------------------------------
  | Restore session on application startup
  |--------------------------------------------------------------------------
  | When the page refreshes, React loses its state.
  | We reload the user from localStorage.
  */
  useEffect(() => {
    const storedUser = authService.getUser();

    if (storedUser) {
      setUser(storedUser);
    }

    // Session verification finished
    setLoading(false);
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Login
  |--------------------------------------------------------------------------
  | Called after a successful authentication.
  */
  const login = (user: User) => {
    setUser(user);
  };

  /*
  |--------------------------------------------------------------------------
  | Logout
  |--------------------------------------------------------------------------
  | Clears localStorage and removes the authenticated user.
  */
  const logout = () => {
    authService.logout();
    setUser(null);
  };

  /*
  |--------------------------------------------------------------------------
  | Context Provider
  |--------------------------------------------------------------------------
  */
  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/*
|--------------------------------------------------------------------------
| Custom Hook
|--------------------------------------------------------------------------
| Allows any component to use:
|
| const { user, login, logout } = useAuth();
|
*/
export const useAuth = () => useContext(AuthContext);