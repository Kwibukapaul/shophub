import { createContext, useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { offlineMessage } from "../lib/errorHandling";

interface ProfileUpdates {
  full_name?: string;
  phone?: string;
  profile_image_url?: string;
}

interface AuthContextType {
  session: Session | null;
  user: any;
  userProfile: any;
  loading: boolean;
  isAdmin: boolean;
  signInWithPassword: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (updates: ProfileUpdates) => Promise<void>;
  isStoreManager: boolean;
  storeId: string | null;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

const getProfileFromAuthUser = (authUser: any) => ({
  full_name:
    authUser?.user_metadata?.full_name ||
    authUser?.user_metadata?.display_name ||
    null,
  phone: authUser?.user_metadata?.phone || authUser?.phone || null,
  profile_image_url: authUser?.user_metadata?.profile_image_url || null,
});

const isServerSideSupabaseError = (error: unknown) => {
  if (!error || typeof error !== "object") {
    return false;
  }

  const status = "status" in error ? (error as { status?: unknown }).status : null;
  if (typeof status === "number" && status >= 500) {
    return true;
  }

  const message = "message" in error ? (error as { message?: unknown }).message : "";
  return typeof message === "string" && /\b500\b|internal|server error/i.test(message);
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isStoreManager, setIsStoreManager] = useState(false);
  const [storeId, setStoreId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const buildPatchedAuthUser = (currentUser: any, profile: ProfileUpdates) => {
    if (!currentUser) {
      return currentUser;
    }

    const currentMetadata = currentUser.user_metadata || {};

    return {
      ...currentUser,
      phone: profile.phone ?? currentUser.phone ?? null,
      user_metadata: {
        ...currentMetadata,
        full_name: profile.full_name ?? currentMetadata.full_name ?? "",
        display_name:
          profile.full_name ??
          currentMetadata.display_name ??
          currentMetadata.full_name ??
          "",
        phone: profile.phone ?? currentMetadata.phone ?? "",
        profile_image_url:
          profile.profile_image_url ?? currentMetadata.profile_image_url ?? "",
      },
    };
  };

  const upsertUserProfileFromAuth = async (
    authUser: any,
    overrides: ProfileUpdates = {},
  ) => {
    if (!authUser?.id) {
      return null;
    }

    const authProfile = getProfileFromAuthUser(authUser);
    const profilePayload = {
      id: authUser.id,
      full_name: overrides.full_name ?? authProfile.full_name,
      phone: overrides.phone ?? authProfile.phone,
      profile_image_url:
        overrides.profile_image_url ?? authProfile.profile_image_url,
    };

    const { data, error } = await supabase
      .from("user_profiles")
      .upsert(profilePayload, { onConflict: "id" })
      .select("*")
      .maybeSingle();

    if (error) {
      throw error;
    }

    setUserProfile(data ?? profilePayload);
    return data ?? profilePayload;
  };

  const fetchUserProfile = async (userId: string, authUser?: any) => {
    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (!error && data) {
      setUserProfile(data);
      return data;
    }

    if (authUser && !error) {
      try {
        return await upsertUserProfileFromAuth(authUser);
      } catch (upsertError) {
        console.error("Failed to restore missing user profile:", upsertError);
      }
    }

    if (authUser && isServerSideSupabaseError(error)) {
      const fallbackProfile = {
        id: userId,
        ...getProfileFromAuthUser(authUser),
        is_admin: false,
        is_active: true,
      };

      setUserProfile(fallbackProfile);
      return fallbackProfile;
    }

    setUserProfile(null);
    return null;
  };

  const checkAdmin = async (userId: string) => {
    const { data, error } = await supabase
      .from("admin_users")
      .select("id")
      .eq("id", userId)
      .maybeSingle();

    setIsAdmin(!error && Boolean(data));
  };

  const checkStoreManager = async (userId: string) => {
    const { data, error } = await supabase
      .from("store_managers")
      .select("store_id")
      .eq("id", userId)
      .maybeSingle();

    if (!error && data) {
      setIsStoreManager(true);
      setStoreId(data.store_id);
      return;
    }

    setIsStoreManager(false);
    setStoreId(null);
  };

  useEffect(() => {
    const init = async () => {
      try {
        try {
          const { data } = await supabase.auth.getSession();
          const currentSession = data.session;

          setSession(currentSession);
          setUser(currentSession?.user ?? null);

          if (currentSession?.user) {
            try {
              const [, , profileData] = await Promise.all([
                checkAdmin(currentSession.user.id),
                checkStoreManager(currentSession.user.id),
                fetchUserProfile(currentSession.user.id, currentSession.user),
              ]);

              if (profileData && profileData.is_active === false) {
                await supabase.auth.signOut({ scope: "local" });
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
          console.error("supabase.auth.getSession error:", getSessionErr);
          const msg = getSessionErr?.message || String(getSessionErr);
          if (msg && msg.toLowerCase().includes("refresh token")) {
            try {
              await supabase.auth.signOut({ scope: "local" });
            } catch (signOutError) {
              console.error(
                "Error signing out after invalid refresh token:",
                signOutError,
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
      async (event, nextSession) => {
        if (
          String(event) === "TOKEN_REFRESH_FAILED" ||
          String(event) === "refresh_token_error"
        ) {
          console.warn("Auth event indicates token refresh failed:", event);
          try {
            await supabase.auth.signOut({ scope: "local" });
          } catch (signOutError) {
            console.error(
              "Error signing out after token refresh failure:",
              signOutError,
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
          setSession(nextSession);
          setUser(nextSession?.user ?? null);

          if (nextSession?.user) {
            try {
              const [, , profileData] = await Promise.all([
                checkAdmin(nextSession.user.id),
                checkStoreManager(nextSession.user.id),
                fetchUserProfile(nextSession.user.id, nextSession.user),
              ]);

              if (profileData && profileData.is_active === false) {
                await supabase.auth.signOut({ scope: "local" });
                return;
              }
            } catch (innerError) {
              console.error("Auth listener helper error:", innerError);
            }
          } else {
            setIsAdmin(false);
            setIsStoreManager(false);
            setStoreId(null);
            setUserProfile(null);
          }
        } catch (error) {
          console.error("Auth state handler failed:", error);
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

    if (error) {
      throw error;
    }

    if (data.session?.user) {
      const profile = await fetchUserProfile(data.session.user.id, data.session.user);

      if (profile && profile.is_active === false) {
        await supabase.auth.signOut({ scope: "local" });
        throw new Error("Your account has been deactivated.");
      }
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          display_name: fullName,
          phone: null,
          profile_image_url: null,
        },
      },
    });

    if (error) {
      throw error;
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut({ scope: "local" });
    setSession(null);
    setUser(null);
    setUserProfile(null);
    setIsAdmin(false);
    setIsStoreManager(false);
    setStoreId(null);
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + "/update-password",
    });

    if (error) {
      throw error;
    }
  };

  const updateProfile = async (updates: ProfileUpdates) => {
    if (!user) {
      throw new Error("No user logged in");
    }

    if (typeof navigator !== "undefined" && !navigator.onLine) {
      throw new Error(offlineMessage);
    }

    const currentProfile = {
      ...getProfileFromAuthUser(user),
      ...userProfile,
    };

    const nextProfile = {
      full_name:
        updates.full_name !== undefined
          ? updates.full_name.trim() || null
          : currentProfile.full_name || null,
      phone:
        updates.phone !== undefined
          ? updates.phone.trim() || null
          : currentProfile.phone || null,
      profile_image_url:
        updates.profile_image_url !== undefined
          ? updates.profile_image_url.trim() || null
          : currentProfile.profile_image_url || null,
    };

    const { data: profileData, error: profileError } = await supabase
      .from("user_profiles")
      .upsert(
        {
          id: user.id,
          full_name: nextProfile.full_name,
          phone: nextProfile.phone,
          profile_image_url: nextProfile.profile_image_url,
        },
        { onConflict: "id" },
      )
      .select("*")
      .maybeSingle();

    if (profileError) {
      throw profileError;
    }

    const patchedUser = buildPatchedAuthUser(user, nextProfile);

    setUser(patchedUser);
    setSession((previous) =>
      previous
        ? {
            ...previous,
            user: patchedUser,
          }
        : previous,
    );
    setUserProfile(profileData ?? { id: user.id, ...nextProfile });
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        userProfile,
        isAdmin,
        isStoreManager,
        storeId,
        loading,
        signInWithPassword,
        signUp,
        signOut,
        resetPassword,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
