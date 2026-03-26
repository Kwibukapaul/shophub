import { Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

export default function AdminRoute({ children }: { children: JSX.Element }) {
  const { user, isAdmin, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!user) return <Navigate to="/login" replace />;

  if (!isAdmin) return <Navigate to="/" replace />;

  return children;
}
