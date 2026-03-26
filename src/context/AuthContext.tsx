import { createContext, useContext, useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

// 1. INTERFACE DEFINITION
interface AuthContextType {
  session: Session | null;
  user: any;
  userProfile: any; // Holds database profile data (name, phone, etc.)
  loading: boolean;
  isAdmin: boolean;
  signInWithPassword: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (updates: {
    full_name?: string;
    phone?: string;
  }) => Promise<void>;
  isStoreManager: boolean;
  storeId: string | null;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null); // State for profile data
  const [isAdmin, setIsAdmin] = useState(false);
  const [isStoreManager, setIsStoreManager] = useState(false);
  const [storeId, setStoreId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper: Fetch user profile from the database
  const fetchUserProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (!error && data) {
      setUserProfile(data);
      return data;
    }
    return null;
  };

  // Helper: Check if user is admin
  const checkAdmin = async (userId: string) => {
    const { data, error } = await supabase
      .from("admin_users")
      .select("id")
      .eq("id", userId)
      .maybeSingle();

    if (!error && data) {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  };

  // Helper: Check if user is store manager
  const checkStoreManager = async (userId: string) => {
    const { data, error } = await supabase
      .from("store_managers")
      .select("store_id")
      .eq("id", userId)
      .maybeSingle();

    if (!error && data) {
      setIsStoreManager(true);
      setStoreId(data.store_id);
    } else {
      setIsStoreManager(false);
      setStoreId(null);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        try {
          const { data } = await supabase.auth.getSession();
          const session = data.session;

          setSession(session);
          setUser(session?.user ?? null);

          if (session?.user) {
            try {
              const [, , profileData] = await Promise.all([
                checkAdmin(session.user.id),
                checkStoreManager(session.user.id),
                fetchUserProfile(session.user.id),
              ]);

              if (profileData && profileData.is_active === false) {
                await supabase.auth.signOut();
                return;
              }
            } catch (innerErr) {
              console.error("Auth helper error:", innerErr);
            }
          } else {
            setIsAdmin(false);
            setIsStoreManager(false);
            setStoreId(null);
            setUserProfile(null);
          }
        } catch (getSessionErr: any) {
          // Handle cases where the client attempted to refresh an invalid/expired token
          console.error("supabase.auth.getSession error:", getSessionErr);
          const msg = getSessionErr?.message || String(getSessionErr);
          if (msg && msg.toLowerCase().includes("refresh token")) {
            try {
              await supabase.auth.signOut();
            } catch (sErr) {
              console.error(
                "Error signing out after invalid refresh token:",
                sErr,
              );
            }
            setSession(null);
            setUser(null);
            setIsAdmin(false);
            setIsStoreManager(false);
            setStoreId(null);
            setUserProfile(null);
            // notify user once
            try {
              alert("Session expired. Please sign in again.");
            } catch (_) {}
          }
        }
      } catch (err) {
        console.error("Auth init failed:", err);
      } finally {
        setLoading(false);
      }
    };

    init();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // If token refresh failed server-side, sign out locally and notify user
        if (
          event === "TOKEN_REFRESH_FAILED" ||
          event === "refresh_token_error"
        ) {
          console.warn("Auth event indicates token refresh failed:", event);
          try {
            await supabase.auth.signOut();
          } catch (sErr) {
            console.error(
              "Error signing out after token refresh failure:",
              sErr,
            );
          }
          setSession(null);
          setUser(null);
          setIsAdmin(false);
          setIsStoreManager(false);
          setStoreId(null);
          setUserProfile(null);
          try {
            alert("Session expired. Please sign in again.");
          } catch (_) {}
          setLoading(false);
          return;
        }

        try {
          setSession(session);
          setUser(session?.user ?? null);

          if (session?.user) {
            try {
              const [, , profileData] = await Promise.all([
                checkAdmin(session.user.id),
                checkStoreManager(session.user.id),
                fetchUserProfile(session.user.id),
              ]);

              if (profileData && profileData.is_active === false) {
                await supabase.auth.signOut();
                return;
              }
            } catch (inner) {
              console.error("Auth listener helper error:", inner);
            }
          } else {
            setIsAdmin(false);
            setIsStoreManager(false);
            setStoreId(null);
            setUserProfile(null);
          }
        } catch (e) {
          console.error("Auth state handler failed:", e);
        } finally {
          setLoading(false);
        }
      },
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const signInWithPassword = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;

    if (data.session?.user) {
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("is_active")
        .eq("id", data.session.user.id)
        .maybeSingle();

      if (profile && profile.is_active === false) {
        await supabase.auth.signOut();
        throw new Error("Your account has been deactivated.");
      }
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;

    if (data.user) {
      // Create the profile entry in the database
      await supabase.from("user_profiles").insert({
        id: data.user.id,
        full_name: fullName,
        email,
      });
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setUserProfile(null); // Clear profile on logout
    setIsAdmin(false);
    setIsStoreManager(false);
    setStoreId(null);
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + "/update-password",
    });
    if (error) throw error;
  };

  const updateProfile = async (updates: {
    full_name?: string;
    phone?: string;
  }) => {
    if (!user) throw new Error("No user logged in");

    const { error } = await supabase
      .from("user_profiles")
      .update(updates)
      .eq("id", user.id);

    if (error) throw error;

    // Optimistically update local state for instant UI feedback
    setUserProfile((prev: any) => ({ ...prev, ...updates }));
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        userProfile, // Exposed
        isAdmin,
        isStoreManager,
        storeId,
        loading,
        signInWithPassword,
        signUp,
        signOut,
        resetPassword, // Exposed
        updateProfile, // Exposed
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
