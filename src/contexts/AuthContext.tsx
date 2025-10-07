"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../lib/firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser 
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount and listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        try {
          // Get customer data from Firestore
          const customerRef = doc(db, 'customers', firebaseUser.uid);
          const customerDoc = await getDoc(customerRef);
          const customerData = customerDoc.data();
          
          const userData: User = {
            id: firebaseUser.uid,
            name: customerData?.name || firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
            email: firebaseUser.email || '',
            phone: customerData?.phone || '',
            avatar: customerData?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(customerData?.name || firebaseUser.email?.split('@')[0] || 'User')}&background=e63946&color=fff`
          };
          
          setUser(userData);
          localStorage.setItem('cranbourne_user', JSON.stringify(userData));
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else {
        setUser(null);
        localStorage.removeItem('cranbourne_user');
      }
      setIsLoading(false);
    });

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Authenticate with Firebase
      await signInWithEmailAndPassword(auth, email, password);
      // Auth state change listener will handle setting user data
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, phone?: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Create user account in Firebase Auth
      const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create customer document in Firestore
      const customerData = {
        customerId: firebaseUser.uid, // Explicitly store the customer ID
        name: name,
        email: email,
        phone: phone || '',
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=e63946&color=fff`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        role: 'customer',
        status: 'active',
        source: 'cranbourne-website' // Track where customer registered from
      };
      
      // Save to customers collection in Firestore
      const customerRef = doc(db, 'customers', firebaseUser.uid);
      await setDoc(customerRef, customerData);
      
      console.log('Customer registered successfully:', {
        uid: firebaseUser.uid,
        email: email,
        name: name,
        phone: phone
      });
      
      // Auth state change listener will handle setting user data
      return true;
    } catch (error) {
      console.error('Registration failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
    setUser(null);
    localStorage.removeItem('cranbourne_user');
  };

  const updateProfile = async (userData: Partial<User>): Promise<boolean> => {
    if (!user) return false;
    
    setIsLoading(true);
    try {
      // Update customer data in Firestore
      const updateData = {
        ...userData,
        customerId: user.id, // Ensure customer ID is always present
        updatedAt: new Date().toISOString()
      };
      
      const customerRef = doc(db, 'customers', user.id);
      await updateDoc(customerRef, updateData);
      
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('cranbourne_user', JSON.stringify(updatedUser));
      
      console.log('Profile updated successfully:', updateData);
      return true;
    } catch (error) {
      console.error('Profile update failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
