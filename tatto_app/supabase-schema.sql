-- Supabase Database Schema for Tattoo App
-- Run these SQL commands in your Supabase SQL editor

-- Enable RLS (Row Level Security)
-- This will be enabled for each table individually
-- Drop existing tables if they exist (BE CAREFUL - this deletes data)



-- User profiles table with text ID for Firebase UIDs
CREATE TABLE user_profiles (
  id text PRIMARY KEY, -- Changed from uuid to text
  email text UNIQUE NOT NULL,
  full_name text,
  avatar_url text,
  role text NOT NULL CHECK (role IN ('customer', 'artist', 'admin')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Artists table
CREATE TABLE artists (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id text NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE, -- Changed to text
  bio text,
  specialties text[] DEFAULT '{}',
  hourly_rate decimal(10,2),
  portfolio_images text[] DEFAULT '{}',
  availability jsonb DEFAULT '{}',
  rating decimal(3,2) DEFAULT 0,
  total_reviews integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Bookings table
CREATE TABLE bookings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id text NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE, -- Changed to text
  artist_id uuid NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  appointment_date timestamp with time zone NOT NULL,
  duration_hours integer NOT NULL DEFAULT 1,
  status text NOT NULL CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')) DEFAULT 'pending',
  description text,
  total_amount decimal(10,2),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Reviews table
CREATE TABLE reviews (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id uuid NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  customer_id text NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE, -- Changed to text
  artist_id uuid NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid()::text = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid()::text = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid()::text = id);

-- RLS Policies for artists
CREATE POLICY "Anyone can view artists" ON artists
  FOR SELECT USING (true);

CREATE POLICY "Artists can update own profile" ON artists
  FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Artists can insert own profile" ON artists
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- RLS Policies for bookings
CREATE POLICY "Users can view own bookings" ON bookings
  FOR SELECT USING (
    auth.uid()::text = customer_id OR 
    auth.uid()::text IN (SELECT user_id FROM artists WHERE id = artist_id)
  );

CREATE POLICY "Customers can create bookings" ON bookings
  FOR INSERT WITH CHECK (auth.uid()::text = customer_id);

CREATE POLICY "Artists and customers can update bookings" ON bookings
  FOR UPDATE USING (
    auth.uid()::text = customer_id OR 
    auth.uid()::text IN (SELECT user_id FROM artists WHERE id = artist_id)
  );

-- RLS Policies for reviews
CREATE POLICY "Anyone can view reviews" ON reviews
  FOR SELECT USING (true);

CREATE POLICY "Customers can create reviews for their bookings" ON reviews
  FOR INSERT WITH CHECK (
    auth.uid()::text = customer_id AND
    EXISTS (
      SELECT 1 FROM bookings 
      WHERE id = booking_id 
      AND customer_id = auth.uid()::text 
      AND status = 'completed'
    )
  );

-- Indexes for better performance
CREATE INDEX idx_user_profiles_email ON user_profiles(email);
CREATE INDEX idx_user_profiles_role ON user_profiles(role);
CREATE INDEX idx_artists_user_id ON artists(user_id);
CREATE INDEX idx_artists_specialties ON artists USING gin(specialties);
CREATE INDEX idx_bookings_customer_id ON bookings(customer_id);
CREATE INDEX idx_bookings_artist_id ON bookings(artist_id);
CREATE INDEX idx_bookings_appointment_date ON bookings(appointment_date);
CREATE INDEX idx_reviews_artist_id ON reviews(artist_id);
CREATE INDEX idx_reviews_customer_id ON reviews(customer_id);

-- Functions to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_artists_updated_at BEFORE UPDATE ON artists 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();