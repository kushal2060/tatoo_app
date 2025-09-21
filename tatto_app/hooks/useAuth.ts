'use client';

import { useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  updateProfile,
  signOut
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { createUserProfile } from '@/lib/database';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials extends LoginCredentials {
  fullName: string;
  role: 'customer' | 'artist';
}

export function useAuthOperations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  const login = async (credentials: LoginCredentials) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await signInWithEmailAndPassword(
        auth, 
        credentials.email, 
        credentials.password
      );
      return result.user;
    } catch (err: any) {
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (credentials: SignupCredentials) => {
  setLoading(true);
  setError(null);
  
  try {
    // Create Firebase auth user
    const result = await createUserWithEmailAndPassword(
      auth, 
      credentials.email, 
      credentials.password
    );

    // Update the user's display name
    await updateProfile(result.user, {
      displayName: credentials.fullName
    });

    // Create user profile in Supabase
    await createUserProfile({
      id: result.user.uid,
      email: credentials.email,
      full_name: credentials.fullName,
      role: credentials.role
    });

    // If user is an artist, create artist profile too
    if (credentials.role === 'artist') {
      const { createArtistProfile } = await import('@/lib/database');
      
      await createArtistProfile({
        user_id: result.user.uid,
        bio: '',
        specialties: [],
        hourly_rate: 100, // Default rate
        portfolio_images: [],
        availability: {
          monday: { enabled: true, start: "09:00", end: "18:00" },
          tuesday: { enabled: true, start: "09:00", end: "18:00" },
          wednesday: { enabled: false, start: "09:00", end: "18:00" },
          thursday: { enabled: true, start: "12:00", end: "20:00" },
          friday: { enabled: true, start: "09:00", end: "18:00" },
          saturday: { enabled: true, start: "10:00", end: "16:00" },
          sunday: { enabled: false, start: "09:00", end: "18:00" }
        },
        rating: 0,
        total_reviews: 0
      });
    }

    return result.user;
  } catch (err: any) {
    setError(err.message || 'Signup failed');
    throw err;
  } finally {
    setLoading(false);
  }
};

  const loginWithGoogle = async (role: 'customer' | 'artist' = 'customer') => {
    setLoading(true);
    setError(null);
    
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Check if this is a new user and create profile if needed
      if (result.user.metadata.creationTime === result.user.metadata.lastSignInTime) {
        await createUserProfile({
          id: result.user.uid,
          email: result.user.email!,
          full_name: result.user.displayName || '',
          avatar_url: result.user.photoURL || undefined,
          role
        });
      }

      return result.user;
    } catch (err: any) {
      setError(err.message || 'Google login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err: any) {
      setError(err.message || 'Password reset failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await signOut(auth);
      // Clear any additional local storage if needed
      localStorage.removeItem('userRole');
      localStorage.removeItem('isAuthenticated');
    } catch (err: any) {
      setError(err.message || 'Logout failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };
  

  return {
    login,
    logout,
    signup,
    loginWithGoogle,
    resetPassword,
    loading,
    error,
    clearError
  };
}