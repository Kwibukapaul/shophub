import { createContext, useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { offlineMessage } from "../lib/errorHandling";
import withTimeout from "../lib/withTimeout";
import { derivePermissions } from "../lib/roles";

interface ProfileUpdates {
  full_name?: string;
  phone?: string;
  profile_image_url?: string;
}

type Role = "admin" | "store_manager" | "customer" | null;

interface AuthContextType {
  // single source of truth
  authState: {
    loading: boolean;
    initialized: boolean;
    user: any | null;
    session: Session | null;
    profile: any | null;
    role: Role;
    storeId: string | null;
  };
  // convenience derived props for backwards compatibility
  session: Session | null;
  user: any | null;
  userProfile: any | null;
  loading: boolean;
  initialized: boolean;
  role: Role;
  permissions: ReturnType<typeof derivePermissions> | null;
  isAdmin: boolean;
  isStoreManager: boolean;
  storeId: string | null;
  // new API
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    fullName: string,
  ) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;

  // backwards compat
  signInWithPassword: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (updates: ProfileUpdates) => Promise<void>;
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

  const status =
    "status" in error ? (error as { status?: unknown }).status : null;
  if (typeof status === "number" && status >= 500) {
    return true;
  }

  const message =
    "message" in error ? (error as { message?: unknown }).message : "";
  return (
    typeof message === "string" &&
    /\b500\b|internal|server error/i.test(message)
  );
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [authState, setAuthState] = useState<{
    loading: boolean;
    initialized: boolean;
    user: any | null;
    session: Session | null;
    profile: any | null;
    role: Role;
    storeId: string | null;
    permissions: ReturnType<typeof derivePermissions> | null;
  }>({
    loading: true,
    initialized: false,
    user: null,
    session: null,
    profile: null,
    role: null,
    storeId: null,
    permissions: null,
  });

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

    return data ?? profilePayload;
  };

  const fetchUserProfile = async (userId: string, authUser?: any) => {
    try {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (!error && data) {
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

        return fallbackProfile;
      }

      return null;
    } catch (err) {
      console.error("fetchUserProfile error:", err);
      return null;
    }
  };

  const checkAdmin = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("admin_users")
        .select("id")
        .eq("id", userId)
        .maybeSingle();

      return !error && Boolean(data);
    } catch (err) {
      console.error("checkAdmin error:", err);
      return false;
    }
  };

  const checkStoreManager = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("store_managers")
        .select("store_id")
        .eq("id", userId)
        .maybeSingle();

      if (!error && data) {
        return { isManager: true, storeId: data.store_id };
      }
      return { isManager: false, storeId: null };
    } catch (err) {
      console.error("checkStoreManager error:", err);
      return { isManager: false, storeId: null };
    }
  };

  useEffect(() => {
    let mounted = true;

    const setStateSafe = (patch: Partial<typeof authState>) => {
      if (!mounted) return;
      setAuthState((prev) => ({ ...prev, ...patch }));
    };

    const init = async () => {
      try {
        if (process.env.NODE_ENV === "development")
          console.debug("Auth Init Start");

        const getSessionPromise = supabase.auth.getSession();
        const { data } = await withTimeout(getSessionPromise, 5000).catch(
          (err) => {
            console.warn("getSession timed out or failed:", err);
            return { data: { session: null } } as any;
          },
        );

        const currentSession = data?.session ?? null;

        // If no session, we're done initializing (public view)
        if (!currentSession) {
          setStateSafe({
            session: null,
            user: null,
            profile: null,
            role: null,
            storeId: null,
            permissions: null,
            loading: false,
            initialized: true,
          });
          if (process.env.NODE_ENV === "development")
            console.debug("No session");
          return;
        }

        // session exists -> we must fetch profile and role before initialized=true
        setStateSafe({
          session: currentSession,
          user: currentSession.user,
          loading: true,
          initialized: false,
        });

        if (process.env.NODE_ENV === "development")
          console.debug("Session Restored — fetching profile");

        const userId = currentSession.user.id;
        try {
          const [isAdminRes, storeRes, profileData] = await Promise.all([
            withTimeout(checkAdmin(userId), 3000).catch(() => false),
            withTimeout(checkStoreManager(userId), 3000).catch(() => ({
              isManager: false,
              storeId: null,
            })),
            withTimeout(
              fetchUserProfile(userId, currentSession.user),
              5000,
            ).catch(() => null),
          ]);

          if (!mounted) return;

          const role: Role = isAdminRes
            ? "admin"
            : storeRes?.isManager
              ? "store_manager"
              : "customer";
          const permissions = derivePermissions(role);

          setStateSafe({
            profile: profileData ?? null,
            role,
            storeId: storeRes?.storeId ?? null,
            permissions,
            loading: false,
            initialized: true,
          });

          if (process.env.NODE_ENV === "development")
            console.debug("Profile Loaded", { profileData, role });

          if (profileData && profileData.is_active === false) {
            await supabase.auth.signOut({ scope: "local" });
          }
        } catch (err) {
          console.error("Background profile/role load failed:", err);
          setStateSafe({
            session: null,
            user: null,
            profile: null,
            role: null,
            storeId: null,
            permissions: null,
            loading: false,
            initialized: true,
          });
        }
      } catch (err) {
        console.error("Auth init failed:", err);
        setStateSafe({
          session: null,
          user: null,
          profile: null,
          role: null,
          storeId: null,
          permissions: null,
          loading: false,
          initialized: true,
        });
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
          if (!mounted) return;
          setStateSafe({
            session: null,
            user: null,
            profile: null,
            role: null,
            storeId: null,
            permissions: null,
            loading: false,
            initialized: true,
          });
          try {
            alert("Session expired. Please sign in again.");
          } catch (_) {}
          return;
        }

        try {
          const sessionVal = nextSession ?? null;

          // No session -> public view
          if (!sessionVal) {
            setStateSafe({
              session: null,
              user: null,
              profile: null,
              role: null,
              storeId: null,
              permissions: null,
              loading: false,
              initialized: true,
            });
            return;
          }

          // session exists -> fetch profile+role before marking initialized
          setStateSafe({
            session: sessionVal,
            user: sessionVal.user,
            loading: true,
            initialized: false,
          });

          try {
            const userId = sessionVal.user.id;
            const [isAdminRes, storeRes, profileData] = await Promise.all([
              withTimeout(checkAdmin(userId), 3000).catch(() => false),
              withTimeout(checkStoreManager(userId), 3000).catch(() => ({
                isManager: false,
                storeId: null,
              })),
              withTimeout(
                fetchUserProfile(userId, sessionVal.user),
                5000,
              ).catch(() => null),
            ]);

            if (!mounted) return;

            const role: Role = isAdminRes
              ? "admin"
              : storeRes?.isManager
                ? "store_manager"
                : "customer";
            const permissions = derivePermissions(role);

            setStateSafe({
              profile: profileData ?? null,
              role,
              storeId: storeRes?.storeId ?? null,
              permissions,
              loading: false,
              initialized: true,
            });

            if (profileData && profileData.is_active === false) {
              await supabase.auth.signOut({ scope: "local" });
            }
          } catch (err) {
            console.error("Auth state listener failed:", err);
            setStateSafe({
              session: null,
              user: null,
              profile: null,
              role: null,
              storeId: null,
              permissions: null,
              loading: false,
              initialized: true,
            });
          }
        } catch (error) {
          console.error("Auth state handler failed:", error);
          setStateSafe({
            session: null,
            user: null,
            profile: null,
            role: null,
            storeId: null,
            permissions: null,
            loading: false,
            initialized: true,
          });
        }
      },
    );

    return () => {
      mounted = false;
      try {
        listener.subscription.unsubscribe();
      } catch (_) {}
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
      const profile = await withTimeout(
        fetchUserProfile(data.session.user.id, data.session.user),
        5000,
      ).catch(() => null);

      if (profile && profile.is_active === false) {
        await supabase.auth.signOut({ scope: "local" });
        throw new Error("Your account has been deactivated.");
      }

      setAuthState((prev) => ({
        ...prev,
        session: data.session ?? prev.session,
        user: data.session?.user ?? prev.user,
        profile: profile ?? prev.profile,
      }));
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

  // New API: login/register/logout + google sign-in and refresh
  const login = signInWithPassword;

  const register = signUp;

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
    });
    if (error) throw error;
  };

  const logout = async () => {
    await supabase.auth.signOut({ scope: "local" });
    setAuthState({
      loading: false,
      initialized: true,
      user: null,
      session: null,
      profile: null,
      role: null,
      storeId: null,
      permissions: null,
    });
  };

  const refreshProfile = async () => {
    const user = authState.user;
    if (!user?.id) return;
    try {
      const profileData = await fetchUserProfile(user.id, user);
      const isAdminRes = await checkAdmin(user.id);
      const storeRes = await checkStoreManager(user.id);
      const role: Role = isAdminRes
        ? "admin"
        : storeRes?.isManager
          ? "store_manager"
          : "customer";
      const permissions = derivePermissions(role);
      setAuthState((prev) => ({
        ...prev,
        profile: profileData ?? null,
        role,
        storeId: storeRes?.storeId ?? null,
        permissions,
      }));
    } catch (err) {
      console.error("refreshProfile failed:", err);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut({ scope: "local" });
    setAuthState({
      loading: false,
      initialized: true,
      user: null,
      session: null,
      profile: null,
      role: null,
      storeId: null,
      permissions: null,
    });
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
    const user = authState.user;
    const userProfile = authState.profile;

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

    setAuthState((prev) => ({
      ...prev,
      user: patchedUser,
      session: prev.session
        ? { ...prev.session, user: patchedUser }
        : prev.session,
      profile: profileData ?? { id: user.id, ...nextProfile },
    }));
  };
  const derivedIsAdmin = authState.role === "admin";
  const derivedIsStoreManager = authState.role === "store_manager";

  return (
    <AuthContext.Provider
      value={{
        authState,
        session: authState.session,
        user: authState.user,
        userProfile: authState.profile,
        loading: authState.loading,
        initialized: authState.initialized,
        role: authState.role,
        permissions: authState.permissions,
        isAdmin: derivedIsAdmin,
        isStoreManager: derivedIsStoreManager,
        storeId: authState.storeId,
        // New API
        login,
        register,
        signInWithGoogle,
        logout,
        refreshProfile,

        // Backwards compat
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
