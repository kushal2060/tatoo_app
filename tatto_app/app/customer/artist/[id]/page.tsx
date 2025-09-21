'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  MapPin, 
  Star, 
  Clock, 
  DollarSign, 
  Heart, 
  Share,
  Camera,
  Award,
  MessageSquare,
  ArrowLeft,
  Mail
} from 'lucide-react';
import  CustomerLayout  from '@/components/layouts/CustomerLayout';
import { getArtistProfile } from '@/lib/database';

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
  created_at: string;
  user_profiles: {
    full_name: string;
    avatar_url: string;
    email: string;
  };
}

// Mock reviews - you can create a reviews table later
const mockReviews = [
  {
    id: 1,
    user: "Sarah M.",
    rating: 5,
    date: "2 weeks ago",
    comment: "Incredible work! The detail is absolutely stunning and exactly what I wanted. Professional and talented!",
    images: []
  },
  {
    id: 2,
    user: "Mike T.",
    rating: 5,
    date: "1 month ago", 
    comment: "Amazing work on my tattoo. Really understood my vision and brought it to life perfectly. Highly recommend!"
  },
  {
    id: 3,
    user: "Emma L.",
    rating: 4,
    date: "2 months ago",
    comment: "Great artist with excellent attention to detail. The healing process went smoothly and the final result exceeded expectations."
  }
];

export default function ArtistDetail() {
  const params = useParams();
  const router = useRouter();
  const artistId = params.id as string;
  
  const [artist, setArtist] = useState<Artist | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedImage, setSelectedImage] = useState(0);

  // Fetch artist data
  useEffect(() => {
    const fetchArtist = async () => {
      if (!artistId) return;
      
      try {
        setLoading(true);
        console.log('Fetching artist with ID:', artistId);
        const artistData = await getArtistProfile(artistId);
        console.log('Artist data:', artistData);
        setArtist(artistData);
      } catch (err: any) {
        console.error('Error fetching artist:', err);
        setError(err.message || 'Failed to load artist profile');
      } finally {
        setLoading(false);
      }
    };

    fetchArtist();
  }, [artistId]);

  // Loading state
  if (loading) {
    return (
      <CustomerLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading artist profile...</p>
          </div>
        </div>
      </CustomerLayout>
    );
  }

  // Error state
  if (error || !artist) {
    return (
      <CustomerLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Artist Not Found</h2>
            <p className="text-gray-600 mb-4">
              {error || 'The artist profile you\'re looking for doesn\'t exist.'}
            </p>
            <Button onClick={() => router.back()} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </CustomerLayout>
    );
  }

  // Parse availability (if it exists)
  const availability = artist.availability || {};
  const weekDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  return (
    <CustomerLayout>
      <div className="space-y-6">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Artists
        </Button>

        {/* Artist Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-6">
            <div className="flex-shrink-0">
              <Avatar className="w-32 h-32">
                <AvatarImage src={artist.user_profiles.avatar_url} />
                <AvatarFallback className="text-2xl">
                  {artist.user_profiles.full_name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
            </div>
            
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{artist.user_profiles.full_name}</h1>
                  <div className="flex items-center space-x-4 mt-2">
                    <Badge variant="outline" className="text-purple-600">
                      {artist.specialties[0] || 'Tattoo Artist'}
                    </Badge>
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-4 w-4 mr-1" />
                      Global • Online
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Clock className="h-4 w-4 mr-1" />
                      Professional
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Heart className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center space-x-6 mb-4">
                <div className="flex items-center">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400 mr-1" />
                  <span className="font-semibold text-lg">{artist.rating}</span>
                  <span className="text-gray-500 ml-1">({artist.total_reviews} reviews)</span>
                </div>
                <div className="flex items-center text-purple-600 font-semibold">
                  <DollarSign className="h-4 w-4" />
                  ${artist.hourly_rate}/hour
                </div>
              </div>

              <p className="text-gray-700 mb-4">{artist.bio}</p>

              <div className="flex flex-wrap gap-2">
                {artist.specialties.map((specialty, index) => (
                  <Badge key={index} variant="secondary">
                    {specialty}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            <Link href={`/customer/book/${artist.id}`} className="flex-1">
              <Button className="w-full bg-purple-600 hover:bg-purple-700">
                Book Appointment
              </Button>
            </Link>
            <Button variant="outline" className="flex-1">
              <MessageSquare className="h-4 w-4 mr-2" />
              Message Artist
            </Button>
          </div>
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="portfolio" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="availability">Availability</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
          </TabsList>

          <TabsContent value="portfolio" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Camera className="h-5 w-5 mr-2" />
                  Portfolio ({artist.portfolio_images.length} images)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {artist.portfolio_images.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {artist.portfolio_images.map((image, index) => (
                      <div
                        key={index}
                        className="aspect-square overflow-hidden rounded-lg cursor-pointer group"
                        onClick={() => setSelectedImage(index)}
                      >
                        <img
                          src={image}
                          alt={`${artist.user_profiles.full_name} Portfolio ${index + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Camera className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No portfolio images available yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Star className="h-5 w-5 mr-2" />
                    Reviews ({artist.total_reviews})
                  </span>
                  <div className="flex items-center space-x-2">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{artist.rating}</span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {mockReviews.map((review) => (
                    <div key={review.id} className="border-b pb-6 last:border-b-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium">{review.user}</h4>
                          <div className="flex items-center mt-1">
                            {[...Array(review.rating)].map((_, i) => (
                              <Star
                                key={i}
                                className="h-4 w-4 fill-yellow-400 text-yellow-400"
                              />
                            ))}
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">{review.date}</span>
                      </div>
                      <p className="text-gray-700 mb-3">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="availability" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Weekly Schedule</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {weekDays.map((day) => {
                      const schedule = availability[day] || { available: true, hours: '9:00 AM - 6:00 PM' };
                      return (
                        <div key={day} className="flex justify-between items-center py-2">
                          <span className="font-medium capitalize">{day}</span>
                          <span className={`text-sm ${schedule.available ? 'text-green-600' : 'text-gray-500'}`}>
                            {schedule.hours || 'Available'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Book a Session</CardTitle>
                </CardHeader>
                <CardContent>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => date < new Date()}
                    className="rounded-md border"
                  />
                  <div className="mt-4">
                    <Link href={`/customer/book/${artist.id}`}>
                      <Button className="w-full">
                        Select Time & Book
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="about" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="h-5 w-5 mr-2" />
                  About {artist.user_profiles.full_name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Bio</h3>
                    <p className="text-gray-700">
                      {artist.bio}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Specialties</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {artist.specialties.map((specialty, index) => (
                        <div key={index}>
                          <h4 className="font-medium">{specialty}</h4>
                          <p className="text-sm text-gray-600">Professional expertise</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-2">Contact Information</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="space-y-2">
                        <div className="flex items-center text-gray-700">
                          <Mail className="h-4 w-4 mr-2" />
                          <span>{artist.user_profiles.email}</span>
                        </div>
                        <div className="flex items-center text-gray-700">
                          <DollarSign className="h-4 w-4 mr-2" />
                          <span>${artist.hourly_rate}/hour</span>
                        </div>
                        <div className="flex items-center text-gray-700">
                          <Star className="h-4 w-4 mr-2 fill-yellow-400 text-yellow-400" />
                          <span>{artist.rating}/5 ({artist.total_reviews} reviews)</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-2">Member Since</h3>
                    <p className="text-gray-700">
                      {new Date(artist.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </CustomerLayout>
  );
}