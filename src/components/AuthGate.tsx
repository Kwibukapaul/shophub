import React from "react";
import { useAuth } from "../context/useAuth";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { initialized } = useAuth();

  if (!initialized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  return <>{children}</>;
}
