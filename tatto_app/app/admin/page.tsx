'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  UserCheck, 
  Calendar, 
  Search,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Eye,
  MapPin,
  Star,
  Loader2
} from 'lucide-react';
import AdminLayout from '@/components/layouts/AdminLayout';
import { getAllArtists, getAllBookings, getAllUserProfiles } from '@/lib/database';

// Add interfaces for the data
interface Artist {
  id: string;
  bio: string;
  specialties: string[];
  hourly_rate: number;
  portfolio_images: string[];
  rating: number;
  total_reviews: number;
  user_profiles: {
    full_name: string;
    email: string;
    avatar_url: string;
    created_at: string;
  };
}

interface Customer {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string;
  created_at: string;
  role: string;
}

interface Booking {
  id: string;
  customer_id: string;
  appointment_date: string;
  duration_hours: number;
  status: string;
  description: string;
  total_amount: number;
  artists: {
    user_profiles: {
      full_name: string;
    };
  };
}

export default function AdminDashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [artists, setArtists] = useState<Artist[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState({
    artists: true,
    customers: true,
    bookings: true
  });

  // Fetch all data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch artists
        const artistsData = await getAllArtists();
        setArtists(artistsData);
        setLoading(prev => ({ ...prev, artists: false }));

        // Fetch customers (filter user profiles for customers only)
        const allUsers = await getAllUserProfiles();
        const customersData = allUsers.filter(user => user.role === 'customer');
        setCustomers(customersData);
        setLoading(prev => ({ ...prev, customers: false }));

        // Fetch bookings
        const bookingsData = await getAllBookings();
        setBookings(bookingsData);
        setLoading(prev => ({ ...prev, bookings: false }));

      } catch (error) {
        console.error('Error fetching admin data:', error);
        setLoading({ artists: false, customers: false, bookings: false });
      }
    };

    fetchData();
  }, []);

  const handleApproveArtist = async (artistId: string) => {
    console.log('Approving artist:', artistId);
    // TODO: Implement artist approval in database
    // You would add an 'approved' field to the artists table
  };

  const handleRejectArtist = async (artistId: string) => {
    console.log('Rejecting artist:', artistId);
    // TODO: Implement artist rejection in database
  };

  const handleDeleteArtist = async (artistId: string) => {
    console.log('Deleting artist:', artistId);
    // TODO: Implement artist deletion
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'pending':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'rejected':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'active':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'inactive':
        return 'bg-gray-50 text-gray-700 border-gray-200';
      case 'confirmed':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'completed':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  // Filter functions for search
 // Replace the filter functions with null-safe versions
const filteredArtists = artists.filter(artist =>
  (artist.user_profiles?.full_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
  (artist.user_profiles?.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
);

const filteredCustomers = customers.filter(customer =>
  (customer.full_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
  (customer.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
);

const filteredBookings = bookings.filter(booking =>
  (booking.description?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
  (booking.artists?.user_profiles?.full_name?.toLowerCase() || '').includes(searchTerm.toLowerCase())
);

  // Count bookings per customer
  const getCustomerBookingCount = (customerId: string) => {
    return bookings.filter(booking => booking.customer_id === customerId).length;
  };

  // Get last booking date for customer
  const getLastBookingDate = (customerId: string) => {
    const customerBookings = bookings.filter(booking => booking.customer_id === customerId);
    if (customerBookings.length === 0) return null;
    
    const lastBooking = customerBookings.sort((a, b) => 
      new Date(b.appointment_date).getTime() - new Date(a.appointment_date).getTime()
    )[0];
    
    return lastBooking.appointment_date;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Manage your platform users and bookings</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Artists</p>
                  <p className="text-2xl font-bold">
                    {loading.artists ? <Loader2 className="h-6 w-6 animate-spin" /> : artists.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <UserCheck className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Customers</p>
                  <p className="text-2xl font-bold">
                    {loading.customers ? <Loader2 className="h-6 w-6 animate-spin" /> : customers.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                  <p className="text-2xl font-bold">
                    {loading.bookings ? <Loader2 className="h-6 w-6 animate-spin" /> : bookings.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending Bookings</p>
                  <p className="text-2xl font-bold">
                    {loading.bookings ? (
                      <Loader2 className="h-6 w-6 animate-spin" />
                    ) : (
                      bookings.filter(b => b.status === 'pending').length
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Management Tabs */}
        <Tabs defaultValue="artists" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="artists">Manage Artists</TabsTrigger>
            <TabsTrigger value="customers">Manage Customers</TabsTrigger>
            <TabsTrigger value="bookings">Manage Bookings</TabsTrigger>
          </TabsList>

          {/* Artists Tab */}
          <TabsContent value="artists" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Artists Management</CardTitle>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search artists..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loading.artists ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredArtists.map((artist) => (
                      <div key={artist.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-center space-x-4">
                          <img
                            src={artist.user_profiles.avatar_url || artist.portfolio_images[0] || '/placeholder-artist.jpg'}
                            alt={artist.user_profiles.full_name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div>
                            <h3 className="font-semibold">{artist.user_profiles.full_name}</h3>
                            <p className="text-sm text-gray-600">{artist.user_profiles.email}</p>
                            <div className="flex items-center space-x-4 mt-1">
                              <div className="flex flex-wrap gap-1">
                                {artist.specialties.slice(0, 2).map((specialty, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {specialty}
                                  </Badge>
                                ))}
                                {artist.specialties.length > 2 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{artist.specialties.length - 2}
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center text-sm text-gray-500">
                                <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                                {artist.rating || 'New'}
                              </div>
                              <div className="text-sm text-gray-500">
                                ${artist.hourly_rate}/hr
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Badge className="bg-green-50 text-green-700 border-green-200 border">
                            Active
                          </Badge>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteArtist(artist.id)}
                              className="text-red-600 border-red-200 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {filteredArtists.length === 0 && !loading.artists && (
                      <div className="text-center py-8 text-gray-500">
                        No artists found.
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Customers Tab */}
          <TabsContent value="customers" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Customers Management</CardTitle>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search customers..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loading.customers ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredCustomers.map((customer) => {
                      const bookingCount = getCustomerBookingCount(customer.id);
                      const lastBooking = getLastBookingDate(customer.id);
                      
                      return (
                        <div key={customer.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                          <div className="flex items-center space-x-4">
                            {customer.avatar_url ? (
                              <img
                                src={customer.avatar_url}
                                alt={customer.full_name}
                                className="w-12 h-12 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                <Users className="h-6 w-6 text-purple-600" />
                              </div>
                            )}
                            <div>
                              <h3 className="font-semibold">{customer.full_name}</h3>
                              <p className="text-sm text-gray-600">{customer.email}</p>
                              <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                                <span>Joined: {new Date(customer.created_at).toLocaleDateString()}</span>
                                <span>Bookings: {bookingCount}</span>
                                {lastBooking && (
                                  <span>Last: {new Date(lastBooking).toLocaleDateString()}</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Badge className={`${getStatusColor(bookingCount > 0 ? 'active' : 'inactive')} border`}>
                              {bookingCount > 0 ? 'Active' : 'Inactive'}
                            </Badge>
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 border-red-200 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {filteredCustomers.length === 0 && !loading.customers && (
                      <div className="text-center py-8 text-gray-500">
                        No customers found.
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Bookings Management</CardTitle>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search bookings..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loading.bookings ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredBookings.map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                            <Calendar className="h-6 w-6 text-orange-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{booking.description}</h3>
                            <p className="text-sm text-gray-600">
                              Customer ID: {booking.customer_id} → {booking.artists.user_profiles.full_name}
                            </p>
                            <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                              <span>{new Date(booking.appointment_date).toLocaleDateString()}</span>
                              <span>{booking.duration_hours}h duration</span>
                              <span className="font-medium text-green-600">${booking.total_amount}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Badge className={`${getStatusColor(booking.status)} border`}>
                            {booking.status}
                          </Badge>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {filteredBookings.length === 0 && !loading.bookings && (
                      <div className="text-center py-8 text-gray-500">
                        No bookings found.
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}