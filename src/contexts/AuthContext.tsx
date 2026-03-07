import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authAPI } from '@/integrations/api/client';
import { useNavigate } from 'react-router-dom';

type AppRole = 'admin' | 'staff' | null;

interface User {
  id: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  session: { user: User | null } | null;
  role: AppRole;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<{ user: User | null } | null>(null);
  const [role, setRole] = useState<AppRole>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const token = localStorage.getItem('auth_token');
    const userId = localStorage.getItem('user_id');
    const userRole = localStorage.getItem('user_role') as AppRole;

    if (token && userId) {
      // Verify token and get user info
      authAPI.getCurrentUser()
        .then((data) => {
          setUser({ id: data.user.id, email: data.user.email });
          setSession({ user: { id: data.user.id, email: data.user.email } });
          setRole(data.user.role || userRole);
          setLoading(false);
        })
        .catch(() => {
          // Token invalid, clear storage
          authAPI.signOut();
          setUser(null);
          setSession(null);
          setRole(null);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const data = await authAPI.signIn(email, password);
      setUser({ id: data.user.id, email: data.user.email });
      setSession({ user: { id: data.user.id, email: data.user.email } });
      setRole(data.role);
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    authAPI.signOut();
    setUser(null);
    setSession(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, role, loading, signIn, signOut }}>
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
