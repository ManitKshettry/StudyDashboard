import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ data: any; error: any }>;
  signUp: (email: string, password: string) => Promise<{ data: any; error: any }>;
  signInWithGoogle: () => Promise<{ data: any; error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const createOrUpdateProfile = async (u: User) => {
    try {
      const { error } = await supabase.from('profiles').upsert({
        id: u.id,
        email: u.email!,
        full_name: u.user_metadata?.full_name || u.user_metadata?.name || '',
        updated_at: new Date().toISOString()
      });

      if (error) {
        console.error("Profile upsert error:", error.message);
        return;
      }
    } catch (error) {
      console.error("Profile upsert error:", error);
      // Don't throw the error - we want auth to work even if profile update fails
    }
  };

  useEffect(() => {
    let mounted = true;
    console.log('Initializing auth context...');

    const initializeSession = async () => {
      if (!mounted) return;
      
      try {
        console.log('Getting session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session initialization error:', error);
          if (mounted) setLoading(false);
          return;
        }

        if (!mounted) return;
        console.log('Session state:', session ? 'Found' : 'Not found');

        if (session?.user) {
          setSession(session);
          setUser(session.user);
          // Handle profile update separately to avoid blocking
          createOrUpdateProfile(session.user).catch(console.error);
        } else {
          setSession(null);
          setUser(null);
        }
      } catch (error) {
        console.error('Session initialization error:', error);
      } finally {
        if (mounted) {
          console.log('Session initialization complete');
          setLoading(false);
        }
      }
    };

    initializeSession();

    // Listen for auth changes
    console.log('Setting up auth state change listener...');
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      console.log('Auth state changed:', event, session?.user?.email);
      
      if (event === 'SIGNED_OUT') {
        console.log('User signed out');
        setSession(null);
        setUser(null);
        localStorage.clear(); // Clear all localStorage
        sessionStorage.clear();
      } else if (session) {
        console.log('Session updated:', event);
        setSession(session);
        setUser(session.user);
        
        if (event === 'SIGNED_IN') {
          console.log('User signed in - updating profile');
          // Handle profile update separately
          createOrUpdateProfile(session.user).catch(console.error);
        }
      }
      
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const result = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      return { data: result.data, error: result.error };
    } catch (error) {
      console.error('Sign in error:', error);
      return { data: null, error };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const result = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });
      return { data: result.data, error: result.error };
    } catch (error) {
      console.error('Sign up error:', error);
      return { data: null, error };
    }
  };

      const signInWithGoogle = () => supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent'
      }
    }
  });

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      sessionStorage.clear();
      localStorage.removeItem('supabase.auth.token');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, session, loading, signIn, signUp, signInWithGoogle, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
