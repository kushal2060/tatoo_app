import { supabase } from './supabase';

// User profile management
export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role: 'customer' | 'artist' | 'admin';
  created_at?: string;
  updated_at?: string;
}

export interface Artist {
  id: string;
  user_id: string;
  bio?: string;
  specialties: string[];
  hourly_rate?: number;
  portfolio_images: string[];
  availability: any;
  rating?: number;
  total_reviews?: number;
}

export interface Booking {
  id: string;
  customer_id: string;
  artist_id: string;
  appointment_date: string;
  duration_hours: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  description?: string;
  total_amount?: number;
  created_at: string;
  updated_at: string;
}

// User Profile Operations
export const createUserProfile = async (profile: Omit<UserProfile, 'created_at' | 'updated_at'>) => {
  console.log('Creating user profile in Supabase:', profile);
  
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }

  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .insert([profile])
      .select()
      .single();
    
    if (error) {
      console.error('Supabase insert error:', error);
      throw error;
    }
    
    console.log('User profile created successfully:', data);
    return data;
  } catch (err) {
    console.error('Error in createUserProfile:', err);
    throw err;
  }
};

// export const getUserProfile = async (userId: string) => {
//   if (!supabase) {
//     throw new Error('Supabase client not initialized');
//   }

//   console.log('Getting user profile for:', userId);
  
//   try {
//     const { data, error } = await supabase
//       .from('user_profiles')
//       .select('*')
//       .eq('id', userId)
//       .single();
    
//     if (error) {
//       console.error('Error getting user profile:', error);
//       throw error;
//     }
    
//     console.log('User profile retrieved:', data);
//     return data;
//   } catch (err) {
//     console.error('Error in getUserProfile:', err);
//     throw err;
//   }
// };

export const getUserProfile = async (userId: string, retries = 3, delay = 1000) => {
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }

  console.log('Getting user profile for:', userId);
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        // If it's the last attempt, throw the error
        if (attempt === retries) {
          console.error('Error getting user profile after all retries:', error);
          throw error;
        }
        
        // If profile not found, wait and retry
        if (error.code === 'PGRST116') { // No rows returned
          console.log(`Profile not found on attempt ${attempt}, retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        // For other errors, throw immediately
        throw error;
      }
      
      console.log('User profile retrieved:', data);
      return data;
    } catch (err) {
      if (attempt === retries) {
        console.error('Error in getUserProfile after all retries:', err);
        throw err;
      }
      
      console.log(`Attempt ${attempt} failed, retrying...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

export const updateUserProfile = async (userId: string, updates: Partial<UserProfile>) => {
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }

  const { data, error } = await supabase
    .from('user_profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

// Artist Operations
export const createArtistProfile = async (artist: Omit<Artist, 'id'>) => {
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }

  const { data, error } = await supabase
    .from('artists')
    .insert([artist])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

// export const getArtistProfile = async (artistId: string) => {
//   if (!supabase) {
//     throw new Error('Supabase client not initialized');
//   }

//   const { data, error } = await supabase
//     .from('artists')
//     .select(`
//       *,
//       user_profiles (
//         full_name,
//         avatar_url,
//         email
//       )
//     `)
//     .eq('id', artistId)
//     .single();
  
//   if (error) throw error;
//   return data;
// };

export const getAllArtists = async () => {
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }

  const { data, error } = await supabase
    .from('artists')
    .select(`
      *,
      user_profiles (
        full_name,
        avatar_url,
        email
      )
    `);
  
  if (error) throw error;
  return data;
};

export async function updateArtistProfile(artistId: string, updates: Partial<{
  bio: string;
  specialties: string[];
  hourly_rate: number;
  availability: any;
  portfolio_images: string[];
}>) {
  const { data, error } = await supabase
    .from('artists')
    .update(updates)
    .eq('id', artistId)
    .select()
    .single();

  if (error) {
    console.error('Error updating artist profile:', error);
    throw error;
  }

  return data;
}

// Booking Operations
export const createBooking = async (booking: Omit<Booking, 'id' | 'created_at' | 'updated_at'>) => {
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }

  const { data, error } = await supabase
    .from('bookings')
    .insert([booking])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const getBookingsByCustomer = async (customerId: string) => {
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }

  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      artists (
        *,
        user_profiles (
          full_name,
          avatar_url
        )
      )
    `)
    .eq('customer_id', customerId)
    .order('appointment_date', { ascending: false });
  
  if (error) throw error;
  return data;
};

export const getBookingsByArtist = async (artistId: string) => {
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }

  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      user_profiles!bookings_customer_id_fkey (
        full_name,
        avatar_url,
        email
      )
    `)
    .eq('artist_id', artistId)
    .order('appointment_date', { ascending: true });
  
  if (error) throw error;
  return data;
};

export const updateBookingStatus = async (bookingId: string, status: Booking['status']) => {
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }

  const { data, error } = await supabase
    .from('bookings')
    .update({ 
      status, 
      updated_at: new Date().toISOString() 
    })
    .eq('id', bookingId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

// Search and filtering
export const searchArtists = async (query: string, filters?: {
  specialties?: string[];
  minRating?: number;
  maxRate?: number;
}) => {
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }

  let queryBuilder = supabase
    .from('artists')
    .select(`
      *,
      user_profiles (
        full_name,
        avatar_url
      )
    `);

  if (query) {
    queryBuilder = queryBuilder.or(`bio.ilike.%${query}%,specialties.cs.{${query}}`);
  }

  if (filters?.specialties?.length) {
    queryBuilder = queryBuilder.overlaps('specialties', filters.specialties);
  }

  if (filters?.minRating) {
    queryBuilder = queryBuilder.gte('rating', filters.minRating);
  }

  if (filters?.maxRate) {
    queryBuilder = queryBuilder.lte('hourly_rate', filters.maxRate);
  }

  const { data, error } = await queryBuilder;
  
  if (error) throw error;
  return data;
};
// Add these to your lib/database.ts file

// export const getCurrentArtist = async () => {
//   const { data: { user } } = await supabase.auth.getUser();
  
//   if (!user) {
//     throw new Error('User not authenticated');
//   }

//   const { data, error } = await supabase
//     .from('artists')
//     .select(`
//       *,
//       user_profiles!user_id (
//         full_name,
//         email,
//         avatar_url
//       )
//     `)
//     .eq('user_id', user.id)
//     .single();

//   if (error) {
//     console.error('Error fetching current artist: ', error)
//     console.log('data', data)
//     throw error;
//   }

//   return data;
// }

// export const getCurrentArtist = async (retries = 3, delay = 1500) => {
//   const { data: { user } } = await supabase.auth.getUser();
  
//   if (!user) {
//     throw new Error('User not authenticated');
//   }

//   for (let attempt = 1; attempt <= retries; attempt++) {
//     try {
//       const { data, error } = await supabase
//         .from('artists')
//         .select(`
//           *,
//           user_profiles!user_id (
//             full_name,
//             email,
//             avatar_url
//           )
//         `)
//         .eq('user_id', user.id)
//         .single();

//       if (error) {
//         // If it's the last attempt, throw the error
//         if (attempt === retries) {
//           console.error('Error fetching current artist after all retries:', error);
//           throw error;
//         }
        
//         // If artist profile not found, wait and retry
//         if (error.code === 'PGRST116') { // No rows returned
//           console.log(`Artist profile not found on attempt ${attempt}, retrying in ${delay}ms...`);
//           await new Promise(resolve => setTimeout(resolve, delay));
//           continue;
//         }
        
//         // For other errors, throw immediately
//         throw error;
//       }

//       console.log('Current artist retrieved:', data);
//       return data;
//     } catch (err) {
//       if (attempt === retries) {
//         console.error('Error in getCurrentArtist after all retries:', err);
//         throw err;
//       }
      
//       console.log(`Attempt ${attempt} failed, retrying...`);
//       await new Promise(resolve => setTimeout(resolve, delay));
//     }
//   }
// };

// Remove getCurrentArtist entirely and enhance getArtistProfile
// export const getArtist = async (
//   identifier: string | 'current', 
//   options: {
//     by?: 'id' | 'user_id';
//     retries?: number;
//     delay?: number;
//   } = {}
// ) => {
//   const { by = 'id', retries = 3, delay = 1500 } = options;

//   if (!supabase) {
//     throw new Error('Supabase client not initialized');
//   }

//   // Handle 'current' artist
//   let queryBy = by;
//   if (identifier === 'current') {
//     const { data: { user } } = await supabase.auth.getUser();
//     if (!user) {
//       throw new Error('User not authenticated');
//     }
//     identifier = user.id;
//     queryBy = 'user_id';
//   }

//   for (let attempt = 1; attempt <= retries; attempt++) {
//     try {
//       const column = queryBy === 'user_id' ? 'user_id' : 'id';
//       const joinClause = queryBy === 'user_id' ? 'user_profiles!user_id' : 'user_profiles';
      
//       const { data, error } = await supabase
//         .from('artists')
//         .select(`
//           *,
//           ${joinClause} (
//             full_name,
//             email,
//             avatar_url
//           )
//         `)
//         .eq(column, identifier)
//         .single();

//       if (error) {
//         if (attempt === retries) {
//           console.error('Error fetching artist after all retries:', error);
//           throw error;
//         }
        
//         if (error.code === 'PGRST116') {
//           console.log(`Artist not found on attempt ${attempt}, retrying in ${delay}ms...`);
//           await new Promise(resolve => setTimeout(resolve, delay));
//           continue;
//         }
        
//         throw error;
//       }

//       return data;
//     } catch (err) {
//       if (attempt === retries) {
//         throw err;
//       }
//       await new Promise(resolve => setTimeout(resolve, delay));
//     }
//   }
// };

// // Keep these as simple wrappers for backward compatibility
// export const getArtistProfile = (artistId: string, retries?: number, delay?: number) => 
//   getArtist(artistId, { by: 'id', retries, delay });

// export const getCurrentArtist = (retries?: number, delay?: number) => 
//   getArtist('current', { retries, delay });
// Update the getArtist function to accept userId parameter
export const getArtist = async (
  identifier: string | 'current', 
  options: {
    by?: 'id' | 'user_id';
    retries?: number;
    delay?: number;
    userId?: string; // Add this parameter
  } = {}
) => {
  const { by = 'id', retries = 3, delay = 1500, userId } = options;

  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }

  // Handle 'current' artist
  let queryBy = by;
  if (identifier === 'current') {
    if (!userId) {
      // Only try supabase auth as fallback
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated - please provide userId parameter');
      }
      identifier = user.id;
    } else {
      identifier = userId;
    }
    queryBy = 'user_id';
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const column = queryBy === 'user_id' ? 'user_id' : 'id';
      const joinClause = queryBy === 'user_id' ? 'user_profiles!user_id' : 'user_profiles';
      
      const { data, error } = await supabase
        .from('artists')
        .select(`
          *,
          ${joinClause} (
            full_name,
            email,
            avatar_url
          )
        `)
        .eq(column, identifier)
        .single();

      if (error) {
        if (attempt === retries) {
          console.error('Error fetching artist after all retries:', error);
          throw error;
        }
        
        if (error.code === 'PGRST116') {
          console.log(`Artist not found on attempt ${attempt}, retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        throw error;
      }

      return data;
    } catch (err) {
      if (attempt === retries) {
        throw err;
      }
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

// Update the wrapper functions
export const getArtistProfile = (artistId: string, retries?: number, delay?: number) => 
  getArtist(artistId, { by: 'id', retries, delay });

// export const getCurrentArtist = (retries?: number, delay?: number, userId?: string) => 
//   getArtist('current', { retries, delay, userId });
export const getCurrentArtist = async (retries = 3, delay = 1500, userId?: string) => {
  let currentUserId = userId;
  
  // Only try to get user from Supabase if userId is not provided
  if (!currentUserId) {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    currentUserId = user.id;
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const { data, error } = await supabase
        .from('artists')
        .select(`
          *,
          user_profiles!user_id (
            full_name,
            email,
            avatar_url
          )
        `)
        .eq('user_id', currentUserId)
        .single();

      if (error) {
        // If it's the last attempt, throw the error
        if (attempt === retries) {
          console.error('Error fetching current artist after all retries:', error);
          throw error;
        }
        
        // If artist profile not found, wait and retry
        if (error.code === 'PGRST116') { // No rows returned
          console.log(`Artist profile not found on attempt ${attempt}, retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        // For other errors, throw immediately
        throw error;
      }

      console.log('Current artist retrieved:', data);
      return data;
    } catch (err) {
      if (attempt === retries) {
        console.error('Error in getCurrentArtist after all retries:', err);
        throw err;
      }
      
      console.log(`Attempt ${attempt} failed, retrying...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};
// Add these functions if not already present
export const getAllUserProfiles = async () => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user profiles:', error);
    throw error;
  }

  return data || [];
};

export const getAllBookings = async () => {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      artists (
        user_profiles (
          full_name
        )
      )
    `)
    .order('appointment_date', { ascending: false });

  if (error) {
    console.error('Error fetching bookings:', error);
    throw error;
  }

  return data || [];
};
// Add this function if it doesn't exist
export const getUserBookings = async (userId: string) => {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      artists (
        user_profiles (
          full_name,
          avatar_url
        )
      )
    `)
    .eq('customer_id', userId)
    .order('appointment_date', { ascending: false });

  if (error) {
    console.error('Error fetching user bookings:', error);
    throw error;
  }

  return data || [];
};