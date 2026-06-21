import { Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

export default function UserRoute({ children }: { children: JSX.Element }) {
  const { user, initialized } = useAuth();

  if (!initialized) return <div>Loading...</div>;

  if (!user) return <Navigate to="/login" replace />;

  return children;
}
