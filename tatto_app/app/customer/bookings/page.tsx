'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  MessageSquare, 
  Phone,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import CustomerLayout from '@/components/layouts/CustomerLayout';
import { useAuth } from '@/lib/auth-context';
import { getUserBookings } from '@/lib/database';
import Link from "next/link";

// Interface for booking data
interface Booking {
  id: string;
  customer_id: string;
  artist_id: string;
  appointment_date: string;
  duration_hours: number;
  status: string;
  description: string;
  total_amount: number;
  created_at: string;
  artists: {
    user_profiles: {
      full_name: string;
      avatar_url: string;
    };
  };
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'confirmed':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'pending':
      return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    case 'completed':
      return <CheckCircle className="h-4 w-4 text-blue-500" />;
    case 'cancelled':
      return <XCircle className="h-4 w-4 text-red-500" />;
    default:
      return <AlertCircle className="h-4 w-4 text-gray-500" />;
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

export default function CustomerBookings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user bookings
  useEffect(() => {
    const fetchBookings = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const userBookings = await getUserBookings(user.uid);
        setBookings(userBookings);
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setError('Failed to load bookings');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user]);

  // Filter bookings
  const upcomingBookings = bookings.filter(booking => 
    booking.status === 'confirmed' || booking.status === 'pending'
  );
  
  const pastBookings = bookings.filter(booking => 
    booking.status === 'completed' || booking.status === 'cancelled'
  );

  const BookingCard = ({ booking }: { booking: Booking }) => {
    const appointmentDate = new Date(booking.appointment_date);
    const bookingDate = new Date(booking.created_at);

    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <img
              src={booking.artists?.user_profiles?.avatar_url || '/placeholder-artist.jpg'}
              alt={booking.artists?.user_profiles?.full_name || 'Artist'}
              className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
            />
            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-lg">
                    {booking.artists?.user_profiles?.full_name || 'Unknown Artist'}
                  </h3>
                  <div className="flex items-center text-sm text-gray-600 mt-1">
                    <MapPin className="h-4 w-4 mr-1" />
                    Available Online
                  </div>
                </div>
                <Badge className={`${getStatusColor(booking.status)} border`}>
                  <div className="flex items-center space-x-1">
                    {getStatusIcon(booking.status)}
                    <span className="capitalize">{booking.status}</span>
                  </div>
                </Badge>
              </div>
              
              <p className="text-gray-700 mb-3">{booking.description || 'No description provided'}</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                  <span>{appointmentDate.toLocaleDateString()}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-gray-400" />
                  <span>{appointmentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-gray-400" />
                  <span>{booking.duration_hours}h</span>
                </div>
                <div className="font-medium text-purple-600">
                  ${booking.total_amount}
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mt-4">
                {booking.status === 'pending' && (
                  <>
                    <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                      Cancel Request
                    </Button>
                    <Button size="sm" variant="outline">
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Message Artist
                    </Button>
                  </>
                )}
                
                {booking.status === 'confirmed' && (
                  <>
                    <Button size="sm" variant="outline">
                      <Phone className="h-4 w-4 mr-1" />
                      Contact Artist
                    </Button>
                    <Button size="sm" variant="outline">
                      View Details
                    </Button>
                    <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                      Reschedule
                    </Button>
                  </>
                )}
                
                {booking.status === 'completed' && (
                  <>
                    <Button size="sm" variant="outline">
                      Leave Review
                    </Button>
                    <Button size="sm" variant="outline">
                      Book Again
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <CustomerLayout>
        <div className="flex justify-center items-center min-h-96">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        </div>
      </CustomerLayout>
    );
  }

  if (error) {
    return (
      <CustomerLayout>
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Bookings</h3>
          <p className="text-gray-600">{error}</p>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
            <p className="text-gray-600">Manage your tattoo appointments</p>
          </div>
          
          <Link href="/customer/browse">
            <Button className="bg-purple-600 hover:bg-purple-700">
              Book New Session
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Upcoming</p>
                  <p className="text-2xl font-bold">{upcomingBookings.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold">{pastBookings.filter(b => b.status === 'completed').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <AlertCircle className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold">{bookings.filter(b => b.status === 'pending').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bookings List */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4 mt-6">
            {upcomingBookings.length > 0 ? (
              upcomingBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming bookings</h3>
                  <p className="text-gray-600 mb-4">Ready to get your next tattoo? Browse our talented artists.</p>
                  <Link href="/customer/browse">
                    <Button className="bg-purple-600 hover:bg-purple-700">
                      Browse Artists
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-4 mt-6">
            {pastBookings.length > 0 ? (
              pastBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No booking history</h3>
                  <p className="text-gray-600">Your completed and cancelled bookings will appear here.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </CustomerLayout>
  );
}