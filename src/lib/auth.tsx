
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session, Provider } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ 
    error: any | null; 
    success: boolean;
  }>;
  signIn: (email: string, password: string) => Promise<{
    error: any | null;
    success: boolean;
  }>;
  signInWithGoogle: () => Promise<{
    error: any | null;
    success: boolean;
  }>;
  signOut: () => Promise<void>;
  updateProfile: (data: { display_name?: string; photo_url?: string }) => Promise<{
    error: any | null;
    success: boolean;
  }>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  signUp: async () => ({ error: null, success: false }),
  signIn: async () => ({ error: null, success: false }),
  signInWithGoogle: async () => ({ error: null, success: false }),
  signOut: async () => {},
  updateProfile: async () => ({ error: null, success: false }),
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // If user just signed up or signed in, initialize their credits and profile
        if ((event === 'SIGNED_IN' || event === 'USER_UPDATED') && session?.user) {
          await initializeUserData(session.user);
        }
      }
    );

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await initializeUserData(session.user);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);
  
  // Initialize user data when a new user signs up
  const initializeUserData = async (user: User) => {
    // Check if user has credits entry
    const { data: creditsData, error: creditsError } = await supabase
      .from('user_credits')
      .select('*')
      .eq('user_id', user.id);
      
    if (creditsError || !creditsData || creditsData.length === 0) {
      // Create user credits if not exist
      await supabase
        .from('user_credits')
        .insert({ user_id: user.id });
    }
    
    // Check if user has profile
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id);
      
    if (profileError || !profileData || profileData.length === 0) {
      // Create profile if not exist
      const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
      const photoUrl = user.user_metadata?.avatar_url || null;
      
      await supabase
        .from('profiles')
        .insert({ 
          user_id: user.id,
          display_name: displayName,
          photo_url: photoUrl
        });
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({ email, password });
      return { error, success: !error };
    } catch (error) {
      return { error, success: false };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error, success: !error };
    } catch (error) {
      return { error, success: false };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });
      return { error, success: !error };
    } catch (error) {
      return { error, success: false };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };
  
  const updateProfile = async (data: { display_name?: string; photo_url?: string }) => {
    if (!user) return { error: "Not authenticated", success: false };
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('user_id', user.id);
      
      return { error, success: !error };
    } catch (error) {
      return { error, success: false };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        loading,
        signUp,
        signIn,
        signInWithGoogle,
        signOut,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
