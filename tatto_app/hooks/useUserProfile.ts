// hooks/useUserProfile.ts
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { getUserProfile } from '@/lib/database';

export function useUserProfile() {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    if (user && !authLoading) {
      setLoading(true);
      setError(null);
      try {
        const userProfile = await getUserProfile(user.uid);
        setProfile(userProfile);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch profile');
        console.error('Error fetching user profile:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user, authLoading]);

  return {
    profile,
    loading: loading || authLoading,
    error,
    role: profile?.role || null,
    refetch: () => {
      if (user) {
        fetchProfile();
      }
    }
  };
}