'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  DollarSign, 
  Star,
  CheckCircle,
  XCircle,
  Upload,
  Camera,
  MessageSquare,
  Phone,
  Loader2
} from 'lucide-react';
import ArtistLayout from '@/components/layouts/ArtistLayout';
import { 
  getBookingsByArtist, 
  updateBookingStatus, 
  getUserProfile,
  getCurrentArtist,
  updateArtistProfile,
  getArtist
} from '@/lib/database';
import { useAuth } from '@/lib/auth-context';

interface Booking {
  id: string;
  customer_id: string;
  appointment_date: string;
  duration_hours: number;
  status: string;
  description: string;
  total_amount: number;
  created_at: string;
  user_profiles: {
    full_name: string;
    email: string;
    avatar_url: string;
  };
}

interface Artist {
  id: string;
  user_id: string;
  bio: string;
  specialties: string[];
  hourly_rate: number;
  portfolio_images: string[];
  rating: number;
  total_reviews: number;
  availability: any;
  user_profiles: {
    full_name: string;
    email: string;
    avatar_url: string;
  };
}

export default function ArtistDashboard() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [artist, setArtist] = useState<Artist | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const { user } = useAuth();
  // Profile state
  const [profile, setProfile] = useState({
    bio: '',
    specialties: '',
    hourlyRate: ''
  });

  // Availability state
  const [availability, setAvailability] = useState({
    monday: { enabled: true, start: "09:00", end: "18:00" },
    tuesday: { enabled: true, start: "09:00", end: "18:00" },
    wednesday: { enabled: false, start: "09:00", end: "18:00" },
    thursday: { enabled: true, start: "12:00", end: "20:00" },
    friday: { enabled: true, start: "09:00", end: "18:00" },
    saturday: { enabled: true, start: "10:00", end: "16:00" },
    sunday: { enabled: false, start: "09:00", end: "18:00" }
  });

  // Fetch artist data and bookings
  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       setLoading(true);
  //       if (!user) {
  //       setError('User not authenticated');
  //       return;
  //     }
        
  //       // Get current artist
  //       const currentArtist = await getCurrentArtist(3,1500,user.uid);
  //       if (!currentArtist) {
  //         setError('Artist profile not found');
  //         return;
  //       }
        
  //       setArtist(currentArtist);
        
  //       // Set profile state
  //       setProfile({
  //         bio: currentArtist.bio || '',
  //         specialties: currentArtist.specialties.join(', ') || '',
  //         hourlyRate: currentArtist.hourly_rate.toString() || ''
  //       });

  //       // Set availability if exists
  //       if (currentArtist.availability) {
  //         setAvailability(currentArtist.availability);
  //       }

  //       // Get artist bookings
  //       const artistBookings = await getBookingsByArtist(currentArtist.id);
  //       setBookings(artistBookings);

  //     } catch (err: any) {
  //       console.error('Error fetching data:', err);
  //       setError(err.message || 'Failed to load data');
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchData();
  // }, []);
  // Update the useEffect to properly handle user dependency
useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null); // Clear previous errors
      
      if (!user) {
        setError('User not authenticated');
        return;
      }
        
      // Get current artist using the user ID from auth context
      const currentArtist = await getCurrentArtist(3, 1500, user.uid);
      if (!currentArtist) {
        setError('Artist profile not found');
        return;
      }
      
      setArtist(currentArtist);
      
      // Set profile state
      setProfile({
        bio: currentArtist.bio || '',
        specialties: currentArtist.specialties.join(', ') || '',
        hourlyRate: currentArtist.hourly_rate.toString() || ''
      });

      // Set availability if exists
      if (currentArtist.availability) {
        setAvailability(currentArtist.availability);
      }

      // Get artist bookings
      const artistBookings = await getBookingsByArtist(currentArtist.id);
      setBookings(artistBookings);

    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Only run when user is available
  if (user) {
    fetchData();
  } else {
    // If no user, clear loading but don't show error yet (auth might still be loading)
    setLoading(false);
  }
}, [user]); // Add user to dependency array

  // Handle booking status updates
  const handleAcceptBooking = async (bookingId: string) => {
    try {
      setUpdating(bookingId);
      await updateBookingStatus(bookingId, 'confirmed');
      
      // Update local state
      setBookings(prev => 
        prev.map(booking => 
          booking.id === bookingId 
            ? { ...booking, status: 'confirmed' }
            : booking
        )
      );
    } catch (err: any) {
      console.error('Error accepting booking:', err);
      alert('Failed to accept booking');
    } finally {
      setUpdating(null);
    }
  };

  const handleRejectBooking = async (bookingId: string) => {
    try {
      setUpdating(bookingId);
      await updateBookingStatus(bookingId, 'cancelled');
      
      // Update local state
      setBookings(prev => 
        prev.map(booking => 
          booking.id === bookingId 
            ? { ...booking, status: 'cancelled' }
            : booking
        )
      );
    } catch (err: any) {
      console.error('Error rejecting booking:', err);
      alert('Failed to reject booking');
    } finally {
      setUpdating(null);
    }
  };

  // Save profile changes
  const handleSaveProfile = async () => {
    if (!artist) return;
    
    try {
      setUpdating('profile');
      
      const updateData = {
        bio: profile.bio,
        specialties: profile.specialties.split(',').map(s => s.trim()).filter(Boolean),
        hourly_rate: parseFloat(profile.hourlyRate) || 0
      };

      await updateArtistProfile(artist.id, updateData);
      
      // Update local state
      setArtist(prev => prev ? {
        ...prev,
        ...updateData
      } : null);

      alert('Profile updated successfully!');
    } catch (err: any) {
      console.error('Error updating profile:', err);
      alert('Failed to update profile');
    } finally {
      setUpdating(null);
    }
  };

  // Save availability changes
  const handleSaveAvailability = async () => {
    if (!artist) return;
    
    try {
      setUpdating('availability');
      
      await updateArtistProfile(artist.id, { availability });
      
      alert('Availability updated successfully!');
    } catch (err: any) {
      console.error('Error updating availability:', err);
      alert('Failed to update availability');
    } finally {
      setUpdating(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'pending':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'completed':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'cancelled':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Calculate stats
  const pendingBookings = bookings.filter(b => b.status === 'pending').length;
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;
  const completedBookings = bookings.filter(b => b.status === 'completed');
  const monthlyEarnings = completedBookings
    .filter(b => new Date(b.appointment_date).getMonth() === new Date().getMonth())
    .reduce((sum, b) => sum + b.total_amount, 0);

  if (loading) {
    return (
      <ArtistLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </ArtistLayout>
    );
  }

 // Update the error display section
if (error || (!loading && !artist)) {
  return (
    <ArtistLayout>
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Unable to Load Dashboard</h2>
          <p className="text-gray-600 mb-4">
            {error || 'Artist profile not found or failed to load'}
          </p>
          <div className="space-y-2">
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline"
            >
              Try Again
            </Button>
            <div className="text-sm text-gray-500">
              {user ? `User ID: ${user.uid}` : 'No user found'}
            </div>
          </div>
        </div>
      </div>
    </ArtistLayout>
  );
}

  return (
    <ArtistLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Avatar className="w-16 h-16">
            <AvatarImage src={artist?.user_profiles.avatar_url} />
            <AvatarFallback>
              {artist?.user_profiles.full_name.split(' ').map(n => n[0]).join('') || 'AA'}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome, {artist?.user_profiles.full_name}</h1>
            <p className="text-gray-600">Manage your profile, availability, and bookings</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CalendarIcon className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending Requests</p>
                  <p className="text-2xl font-bold">{pendingBookings}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Confirmed</p>
                  <p className="text-2xl font-bold">{confirmedBookings}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">This Month</p>
                  <p className="text-2xl font-bold">${monthlyEarnings.toFixed(0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Star className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Rating</p>
                  <p className="text-2xl font-bold">{artist?.rating || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Management Tabs */}
        <Tabs defaultValue="bookings" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="bookings">Manage Bookings</TabsTrigger>
            <TabsTrigger value="profile">Update Profile</TabsTrigger>
            <TabsTrigger value="availability">Availability Calendar</TabsTrigger>
          </TabsList>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Booking Requests ({bookings.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {bookings.length === 0 ? (
                  <div className="text-center py-12">
                    <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600">No bookings yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <div key={booking.id} className="border rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <Avatar className="w-10 h-10">
                              <AvatarImage src={booking.user_profiles.avatar_url} />
                              <AvatarFallback>
                                {booking.user_profiles.full_name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-semibold text-lg">{booking.user_profiles.full_name}</h3>
                              <p className="text-gray-600">{booking.user_profiles.email}</p>
                            </div>
                          </div>
                          <Badge className={`${getStatusColor(booking.status)} border`}>
                            {booking.status}
                          </Badge>
                        </div>
                        
                        <p className="text-gray-700 mb-3">{booking.description}</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                          <div className="flex items-center">
                            <CalendarIcon className="h-4 w-4 mr-2 text-gray-400" />
                            <span>{formatDate(booking.appointment_date)}</span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2 text-gray-400" />
                            <span>{formatTime(booking.appointment_date)}</span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2 text-gray-400" />
                            <span>{booking.duration_hours} hours</span>
                          </div>
                          <div className="font-medium text-purple-600">
                            ${booking.total_amount}
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          {booking.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleAcceptBooking(booking.id)}
                                disabled={updating === booking.id}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                {updating === booking.id ? (
                                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                ) : (
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                )}
                                Accept
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRejectBooking(booking.id)}
                                disabled={updating === booking.id}
                                className="text-red-600 border-red-200 hover:bg-red-50"
                              >
                                {updating === booking.id ? (
                                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                ) : (
                                  <XCircle className="h-4 w-4 mr-1" />
                                )}
                                Decline
                              </Button>
                            </>
                          )}
                          
                          <Button size="sm" variant="outline">
                            <MessageSquare className="h-4 w-4 mr-1" />
                            Message
                          </Button>
                          
                          {booking.status === 'confirmed' && (
                            <Button size="sm" variant="outline">
                              <Phone className="h-4 w-4 mr-1" />
                              Call
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={profile.bio}
                      onChange={(e) => setProfile({...profile, bio: e.target.value})}
                      rows={4}
                      placeholder="Tell customers about your experience and style..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="specialties">Specialties (comma separated)</Label>
                    <Input
                      id="specialties"
                      value={profile.specialties}
                      onChange={(e) => setProfile({...profile, specialties: e.target.value})}
                      placeholder="e.g., Realism, Traditional, Neo-Traditional"
                    />
                  </div>
                  <div>
                    <Label htmlFor="rate">Hourly Rate ($)</Label>
                    <Input
                      id="rate"
                      type="number"
                      value={profile.hourlyRate}
                      onChange={(e) => setProfile({...profile, hourlyRate: e.target.value})}
                      placeholder="150"
                    />
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={handleSaveProfile}
                    disabled={updating === 'profile'}
                  >
                    {updating === 'profile' ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Profile'
                    )}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Camera className="h-5 w-5 mr-2" />
                    Portfolio Images ({artist?.portfolio_images.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    {artist?.portfolio_images.slice(0, 4).map((image, index) => (
                      <div key={index} className="aspect-square overflow-hidden rounded-lg">
                        <img
                          src={image}
                          alt={`Portfolio ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                    {(artist?.portfolio_images?.length || 0) < 4 && (
                      [...Array(4 - (artist?.portfolio_images?.length || 0))].map((_, index) => (
                        <div key={`empty-${index}`} className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                          <Camera className="h-8 w-8 text-gray-400" />
                        </div>
                      ))
                    )}
                  </div>
                  <Button variant="outline" className="w-full">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Images
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Availability Tab */}
          <TabsContent value="availability" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Weekly Schedule</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(availability).map(([day, schedule]) => (
                      <div key={day} className="flex items-center justify-between py-2">
                        <div className="flex items-center space-x-3">
                          <Switch
                            checked={schedule.enabled}
                            onCheckedChange={(checked) =>
                              setAvailability({
                                ...availability,
                                [day]: { ...schedule, enabled: checked }
                              })
                            }
                          />
                          <span className="font-medium capitalize w-20">{day}</span>
                        </div>
                        {schedule.enabled && (
                          <div className="flex items-center space-x-2">
                            <Input
                              type="time"
                              value={schedule.start}
                              onChange={(e) =>
                                setAvailability({
                                  ...availability,
                                  [day]: { ...schedule, start: e.target.value }
                                })
                              }
                              className="w-24"
                            />
                            <span>to</span>
                            <Input
                              type="time"
                              value={schedule.end}
                              onChange={(e) =>
                                setAvailability({
                                  ...availability,
                                  [day]: { ...schedule, end: e.target.value }
                                })
                              }
                              className="w-24"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <Button 
                    className="w-full mt-4" 
                    onClick={handleSaveAvailability}
                    disabled={updating === 'availability'}
                  >
                    {updating === 'availability' ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Schedule'
                    )}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Calendar View</CardTitle>
                </CardHeader>
                <CardContent className="w-full">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="w-full rounded-md border"
                  />
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-700">
                      Click on dates to block specific days or set special hours
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </ArtistLayout>
  );
}