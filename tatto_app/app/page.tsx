'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/lib/auth-context';
import { useAuthOperations } from '@/hooks/useAuth';
import { Star, MapPin, Clock, Shield, Users, Palette, LogOut, User } from 'lucide-react';
import { useUserProfile } from '@/hooks/useDatabase';
import { useState, useEffect } from 'react';
import { getAllArtists } from '@/lib/database';

// Add interface for artist data
interface FeaturedArtist {
  id: string;
  bio: string;
  specialties: string[];
  hourly_rate: number;
  portfolio_images: string[];
  rating: number;
  total_reviews: number;
  user_profiles: {
    full_name: string;
    avatar_url: string;
  };
}

export default function Home() {
  const { user, loading } = useAuth();
  const { logout } = useAuthOperations();
  const { profile, loading: profileLoading } = useUserProfile();
  const role = profile?.role;

  // Add state for featured artists
  const [featuredArtists, setFeaturedArtists] = useState<FeaturedArtist[]>([]);
  const [artistsLoading, setArtistsLoading] = useState(true);

  // Fetch featured artists
  useEffect(() => {
    const fetchFeaturedArtists = async () => {
      try {
        setArtistsLoading(true);
        const artists = await getAllArtists();
        // Get top 3 artists with highest ratings or most recent
        const featured = artists
          .filter(artist => artist.portfolio_images.length > 0) // Only show artists with portfolio images
          .sort((a, b) => b.rating - a.rating) // Sort by rating
          .slice(0, 3); // Take top 3
        setFeaturedArtists(featured);
      } catch (error) {
        console.error('Error fetching featured artists:', error);
        // Fallback to empty array - component will handle this gracefully
        setFeaturedArtists([]);
      } finally {
        setArtistsLoading(false);
      }
    };

    fetchFeaturedArtists();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Get user display name or email
  const getUserDisplayName = () => {
    if (!user) return 'User';
    return user.displayName || user.email?.split('@')[0] || 'User';
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user) return 'U';
    const name = user.displayName || user.email || 'User';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Determine where to redirect based on user role
  const getBrowseLink = () => {
    if (role === 'artist') return '/artist';
    if (role === 'admin') return '/admin';
    else return `/customer/browse`;
  };

  // Get artist location from bio or default
  const getArtistLocation = (artist: FeaturedArtist) => {
    // You can extract location from bio or add a location field to your database
    // For now, return a default or extract from bio
    return "Global"; // You can enhance this later
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-orange-50">
      {/* Navigation - keep existing navigation code */}
      <nav className="bg-white/80 backdrop-blur-md border-b-0 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Palette className="h-8 w-8 text-purple-600" />
              <span className="text-xl font-bold text-gray-900">Tattoist</span>
            </div>

            <div className="flex items-center space-x-4">
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
                  <span className="text-sm text-gray-500">Loading...</span>
                </div>
              ) : user ? (
                <div className="flex items-center space-x-3">
                  <span className="hidden sm:block text-sm font-medium text-gray-700">
                    Welcome, {getUserDisplayName()}!
                  </span>
                  <Link href={getBrowseLink()}>
                    <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Avatar className="h-8 w-8 cursor-pointer" onClick={() => window.location.href = getBrowseLink()}>
                    <AvatarImage src={user.photoURL || undefined} />
                    <AvatarFallback>{getUserInitials()}</AvatarFallback>
                  </Avatar>
                  <Button variant="ghost" size="sm" onClick={handleLogout}>
                    <LogOut className="h-4 w-4" />
                    <span className="hidden sm:inline ml-1">Logout</span>
                  </Button>
                </div>
              ) : (
                <div className="flex space-x-4">
                  <Link href="/auth">
                    <Button variant="ghost">Login</Button>
                  </Link>
                  <Link href="/auth">
                    <Button className="bg-purple-600 hover:bg-purple-700">Get Started</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - keep existing hero section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Connect with 
            <span className="bg-gradient-to-r from-purple-600 to-orange-500 bg-clip-text text-transparent"> Talented Artists</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Discover exceptional tattoo artists, book appointments seamlessly, and bring your artistic vision to life. 
            This platform helps connecting tattoo enthusiasts with skilled professionals from all over the world.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <Link href={getBrowseLink()}>
                <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
                  Continue Browsing
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/auth?role=customer">
                  <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
                    Find an Artist
                  </Button>
                </Link>
                <Link href="/auth?role=artist">
                  <Button variant="outline" size="lg">
                    Join as Artist
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features - keep existing features section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Why Choose Tattoist?
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-6 text-center">
              <Users className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Verified Artists</h3>
              <p className="text-gray-600">Browse through carefully vetted professional tattoo artists with proven expertise.</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-6 text-center">
              <Clock className="h-12 w-12 text-orange-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Easy Booking</h3>
              <p className="text-gray-600">Schedule appointments instantly with real-time availability and confirmation.</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-6 text-center">
              <Shield className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Secure Platform</h3>
              <p className="text-gray-600">Safe and secure platform with verified reviews and protected transactions.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Featured Artists - Updated to use real data */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-white/50 rounded-3xl">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Featured Artists
        </h2>
        
        {artistsLoading ? (
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-0">
                  <div className="aspect-square bg-gray-200 rounded-t-lg"></div>
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : featuredArtists.length > 0 ? (
          <div className="grid md:grid-cols-3 gap-6">
            {featuredArtists.map((artist) => (

                <Card key={artist.id} className="group hover:shadow-xl transition-all duration-300 cursor-pointer">
                  <CardContent className="p-0">
                    <div className="aspect-square overflow-hidden rounded-t-lg">
                      <img 
                        src={artist.portfolio_images[0] || artist.user_profiles.avatar_url || '/placeholder-artist.jpg'} 
                        alt={artist.user_profiles.full_name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-lg">{artist.user_profiles.full_name}</h3>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {artist.specialties.slice(0, 2).map((specialty, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {specialty}
                          </Badge>
                        ))}
                        {artist.specialties.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{artist.specialties.length - 2}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <MapPin className="h-4 w-4 mr-1" />
                        {getArtistLocation(artist)}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                          <span className="font-medium">{artist.rating || 'New'}</span>
                          {artist.total_reviews > 0 && (
                            <span className="text-sm text-gray-500 ml-1">
                              ({artist.total_reviews})
                            </span>
                          )}
                        </div>
                        <div className="text-sm font-medium text-purple-600">
                          ${artist.hourly_rate}/hr
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">No featured artists available at the moment.</p>
          </div>
        )}
        
        <div className="text-center mt-8">
          {user ? (
            <Link href={getBrowseLink()}>
              <Button size="lg" variant="outline">
                View All Artists
              </Button>
            </Link>
          ) : (
            <Link href="/auth?role=customer">
              <Button size="lg" variant="outline">
                View All Artists
              </Button>
            </Link>
          )}
        </div>
      </section>

      {/* Footer - keep existing footer */}
      <footer className="bg-gray-900 text-white py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Palette className="h-6 w-6 text-purple-400" />
                <span className="text-lg font-bold">Tattoist</span>
              </div>
              <p className="text-gray-400">Connecting tattoo enthusiasts with talented artists worldwide.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">For Customers</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Find Artists</li>
                <li>Book Appointments</li>
                <li>Reviews & Ratings</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">For Artists</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Join Platform</li>
                <li>Manage Bookings</li>
                <li>Build Portfolio</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>Terms of Service</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Tattoist. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}