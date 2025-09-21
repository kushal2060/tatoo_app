'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { 
  getUserProfile, 
  getArtistProfile, 
  getAllArtists, 
  getBookingsByCustomer, 
  getBookingsByArtist,
  UserProfile,
  Artist,
  Booking
} from '@/lib/database';

export function useUserProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      setProfile(null);
      setLoading(false);
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const profileData = await getUserProfile(user.uid);
      setProfile(profileData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { profile, loading, error, refetch: fetchProfile };
}

export function useArtistProfile(artistId?: string) {
  const { user } = useAuth();
  const [artist, setArtist] = useState<Artist | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const id = artistId || user?.uid;
    if (id) {
      fetchArtist(id);
    }
  }, [artistId, user]);

  const fetchArtist = async (id: string) => {
    try {
      setLoading(true);
      const artistData = await getArtistProfile(id);
      setArtist(artistData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { artist, loading, error, refetch: () => fetchArtist(artistId || user?.uid!) };
}

export function useArtists() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchArtists();
  }, []);

  const fetchArtists = async () => {
    try {
      setLoading(true);
      const artistsData = await getAllArtists();
      setArtists(artistsData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { artists, loading, error, refetch: fetchArtists };
}

export function useBookings(type: 'customer' | 'artist' = 'customer') {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user, type]);

  const fetchBookings = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const bookingsData = type === 'customer' 
        ? await getBookingsByCustomer(user.uid)
        : await getBookingsByArtist(user.uid);
      setBookings(bookingsData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { bookings, loading, error, refetch: fetchBookings };
}