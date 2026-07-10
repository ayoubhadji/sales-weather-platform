import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  role?: "ADMIN" | "FRANCHISE";
}

export default function ProtectedRoute({
  children,
  role,
}: ProtectedRouteProps) {
  const { user, isAuthenticated, loading } = useAuth();

  // Wait until localStorage has been checked
if (loading) {
  return <div>Loading...</div>;
}

  // User not logged in
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Role required but user doesn't have it
  if (role && user?.role !== role) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
