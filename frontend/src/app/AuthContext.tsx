import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: number;
  username: string;
  email: string;
  roles: string[];
}

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8080').replace(/\/+$/, '') + '/api';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // true until /auth/me resolves

  // On mount, verify session via HttpOnly cookie — no localStorage token needed
  useEffect(() => {
    const verifySession = async () => {
      try {
        const res = await fetch(`${API_BASE}/auth/me`, {
          credentials: 'include', // send the HttpOnly auth_token cookie
        });

        if (res.ok) {
          const data = await res.json();
          if (data?.id) setUser(data as User);
        } else {
          // 401/403 — cookie missing or expired, treat as logged out
          setUser(null);
        }
      } catch {
        // Network error — keep user null (unauthenticated)
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    verifySession();
  }, []);

  /**
   * Called after a successful login response.
   * The JWT cookie was already set by the server — we just store the user info in state.
   */
  const login = (newUser: User) => {
    setUser(newUser);
    // NOTE: Token is in an HttpOnly cookie set by the server — NOT stored in localStorage
  };

  /**
   * Calls the backend logout endpoint which expires the HttpOnly cookie,
   * then clears local user state.
   */
  const logout = async () => {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch {
      // Even if the request fails, clear local state so the UI reflects logged-out status
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
