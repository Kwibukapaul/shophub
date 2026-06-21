import { Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

export default function AdminRoute({ children }: { children: JSX.Element }) {
  const { user, role, initialized } = useAuth();

  if (!initialized) return <div>Loading...</div>;

  if (!user) return <Navigate to="/login" replace />;

  if (role !== "admin") return <Navigate to="/" replace />;

  return children;
}
