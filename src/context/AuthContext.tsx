
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/middleware";
import { User as SupabaseUser, Session } from "@supabase/supabase-js";

// Define user type
export interface User {
  id: string;
  email: string;
  name: string;
  userName: string;
  avatar?: string;
}

// Define auth context type
interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, userName: string) => Promise<void>;
  logout: () => void;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

  // Initialize auth state
  useEffect(() => {
    // Set up auth state listener
    let subscription: { unsubscribe: () => void } | undefined;
    
    try {
      const authStateChange = supabase.auth.onAuthStateChange(
        (event, session) => {
          setSession(session);
          
          if (session?.user) {
            // Get user profile from database
            setTimeout(async () => {
              const { data, error } = await supabase
                .from('user_profiles')
                .select('name, user_name, avatar')
                .eq('id', session.user.id)
                .single();

              if (error) {
                console.error('Error fetching user profile:', error);
                return;
              }

              if (data) {
                setUser({
                  id: session.user.id,
                  email: session.user.email || '',
                  name: data.name || '',
                  userName: data.user_name || '',
                  avatar: data.avatar || '',
                });
              }
            }, 0);
          } else {
            setUser(null);
          }
        }
      );
      
      // Store the subscription safely
      if (authStateChange && authStateChange.data) {
        subscription = authStateChange.data.subscription;
      }
    } catch (error) {
      console.error('Error setting up auth listener:', error);
    }

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      
      if (session?.user) {
        // Get user profile from database
        supabase
          .from('user_profiles')
          .select('name, user_name, avatar')
          .eq('id', session.user.id)
          .single()
          .then(({ data, error }) => {
            if (error) {
              console.error('Error fetching user profile:', error);
              setLoading(false);
              return;
            }

            if (data) {
              setUser({
                id: session.user.id,
                email: session.user.email || '',
                name: data.name || '',
                userName: data.user_name || '',
                avatar: data.avatar || '',
              });
            }
            setLoading(false);
          });
      } else {
        setLoading(false);
      }
    });

    return () => {
      // Only call unsubscribe if subscription exists
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        toast.error(error.message);
        throw error;
      }
      
      toast.success("Logged in successfully");
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (name: string, email: string, password: string, userName: string) => {
    try {
      setLoading(true);
      
      // Check if username already exists
      const { data: existingUsers, error: checkError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('user_name', userName);
      
      if (checkError) {
        toast.error("Error checking username");
        throw checkError;
      }
      
      if (existingUsers && existingUsers.length > 0) {
        toast.error("Username already taken");
        throw new Error("Username already taken");
      }
      
      // Create new user
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            userName,
          },
        },
      });
      
      if (error) {
        toast.error(error.message);
        throw error;
      }
      
      toast.success("Account created successfully");
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    toast.success("Logged out successfully");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
