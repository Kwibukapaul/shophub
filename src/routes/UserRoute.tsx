import { Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { getDashboardForRole } from "../lib/roles";

export default function UserRoute({ children }: { children: JSX.Element }) {
  const { user, initialized, role } = useAuth();

  if (!initialized) return <div>Loading...</div>;

  if (!user) return <Navigate to="/login" replace />;

  // If user has a role that doesn't map to the customer dashboard, redirect
  if (role && role !== "customer" && role !== "user") {
    return <Navigate to={getDashboardForRole(role)} replace />;
  }

  return children;
}
