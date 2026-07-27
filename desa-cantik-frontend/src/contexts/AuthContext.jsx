import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { authApi } from "@/services/authApi";
import { apiClient } from "@/services/apiClient";

const AuthContext = createContext(null);
const ACTIVE_VILLAGE_KEY = "desaCantikActiveVillage";

const readActiveVillage = () => {
  try {
    return localStorage.getItem(ACTIVE_VILLAGE_KEY);
  } catch {
    return null;
  }
};

export function AuthProvider({ children }) {
  // FIX: Only initialize user from storage if we also have a valid token
  // This prevents stale user data from being used after logout
  const initialToken = apiClient.getToken();
  const [user, setUser] = useState(() =>
    initialToken ? authApi.getStoredUser() : null
  );
  const [activeVillageId, setActiveVillageId] = useState(() => {
    if (!initialToken) return null; // Don't use stale village ID if no token
    return (
      readActiveVillage() ||
      authApi.getStoredUser()?.village?.id?.toString() ||
      null
    );
  });
  // FIX: Store token in React state to ensure reactivity on logout
  const [token, setToken] = useState(() => initialToken);
  // FIX: Add isLoading state to prevent flash of protected content during auth check
  const [isLoading, setIsLoading] = useState(!!initialToken); // Only loading if we have a token to validate

  useEffect(() => {
    // Check if we have a stored token but no user - need to validate
    if (token && !user) {
      authApi
        .me()
        .then((profile) => {
          if (profile) {
            setUser(profile);

            // FIX: Prioritize the user's assigned village if they have one (e.g. Village Officer)
            // preventing access to other villages' data from stale localStorage
            if (profile?.village?.id) {
              const assignedId = profile.village.id.toString();
              if (activeVillageId !== assignedId) {
                setActiveVillageId(assignedId);
              }
            } else if (!activeVillageId && profile?.village?.id) {
              // Fallback for cases where it's not set (though covered above, safe to keep or simplify)
              setActiveVillageId(profile.village.id.toString());
            }
          }
        })
        .catch(() => {
          // Token is invalid, clear everything
          authApi.logout();
          setUser(null);
          setToken(null);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      // No token or already have user, done loading
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    try {
      if (activeVillageId) {
        localStorage.setItem(ACTIVE_VILLAGE_KEY, activeVillageId);
      } else {
        localStorage.removeItem(ACTIVE_VILLAGE_KEY);
      }
    } catch {
      /* ignore storage errors */
    }
  }, [activeVillageId]);

  const value = useMemo(
    () => ({
      user,
      token,
      isLoading, // FIX: Expose loading state
      activeVillageId,
      setActiveVillageId,
      login: async (username, password) => {
        const { user: loggedInUser, token: newToken } = await authApi.login(
          username,
          password
        );
        setUser(loggedInUser);
        setToken(newToken); // FIX: Also update token state
        if (loggedInUser?.village?.id) {
          setActiveVillageId(loggedInUser.village.id.toString());
        }
        return loggedInUser;
      },
      logout: () => {
        authApi.logout();
        setUser(null);
        setToken(null); // FIX: Clear token state on logout
        setActiveVillageId(null);
      },
      refreshUser: async () => {
        const profile = await authApi.me();
        setUser(profile);
        if (profile?.village?.id) {
          setActiveVillageId(profile.village.id.toString());
        }
        return profile;
      },
    }),
    [user, token, isLoading, activeVillageId]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
};
