// 'use client';

// import { useState } from 'react';
// import Link from 'next/link';
// import { useAuth } from '@/lib/auth-context';
// import { AuthGuard } from '@/components/AuthGuard';
// import { Input } from '@/components/ui/input';
// import { Button } from '@/components/ui/button';
// import { Card, CardContent } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Search, MapPin, Star, Grid, List, User } from 'lucide-react';
// import CustomerLayout from '@/components/layouts/CustomerLayout';

// // const mockArtists = [
// //   {
// //     id: 1,
// //     name: "Alex Rivera",
// //     style: "Realism",
// //     location: "New York, NY",
// //     rating: 4.9,
// //     reviews: 156,
// //     image: "https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=400",
// //     hourlyRate: "$150-200",
// //     specialties: ["Portraits", "Animals", "Black & Gray"],
// //     availability: "Available"
// //   }
// // ];

// function BrowseArtistsContent() {
//   const { user } = useAuth();
//   const [searchTerm, setSearchTerm] = useState('');

//   return (
//     <CustomerLayout>
//       <div className="space-y-6">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-900">Browse Artists</h1>
//           <p className="text-gray-600">Find the perfect tattoo artist for your next piece</p>
//           {user && (
//             <p className="text-sm text-purple-600 mt-2">
//               Welcome back, {user.displayName || user.email}!
//             </p>
//           )}
//         </div>

//         <div className="bg-white p-6 rounded-lg shadow-sm border">
//           <div className="relative mb-4">
//             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
//             <Input
//               placeholder="Search artists or styles..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="pl-10"
//             />
//           </div>
//           <div className="text-sm text-gray-600">
//             Found {mockArtists.length} artists
//           </div>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {mockArtists.map((artist) => (
//             <Link key={artist.id} href={`/customer/artist/${artist.id}`}>
//               <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer h-full">
//                 <CardContent className="p-0">
//                   <div className="aspect-square overflow-hidden rounded-t-lg">
//                     <img 
//                       src={artist.image} 
//                       alt={artist.name}
//                       className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
//                     />
//                   </div>
//                   <div className="p-4">
//                     <div className="flex justify-between items-start mb-2">
//                       <h3 className="font-semibold text-lg">{artist.name}</h3>
//                       <Badge variant="default" className="bg-green-500">
//                         {artist.availability}
//                       </Badge>
//                     </div>
//                     <Badge variant="outline" className="mb-2">{artist.style}</Badge>
//                     <div className="flex items-center text-sm text-gray-600 mb-2">
//                       <MapPin className="h-4 w-4 mr-1" />
//                       {artist.location}
//                     </div>
//                     <div className="flex items-center justify-between mb-3">
//                       <div className="flex items-center">
//                         <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
//                         <span className="font-medium">{artist.rating}</span>
//                         <span className="text-gray-500 ml-1">({artist.reviews})</span>
//                       </div>
//                       <span className="text-sm font-medium text-purple-600">{artist.hourlyRate}</span>
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>
//             </Link>
//           ))}
//         </div>
//       </div>
//     </CustomerLayout>
//   );
// }

// export default function BrowseArtists() {
//   return (
//     <AuthGuard requiredRole="customer">
//       <BrowseArtistsContent />
//     </AuthGuard>
//   );
// } 
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import CustomerLayout from '@/components/layouts/CustomerLayout';
import { useAuth } from '@/lib/auth-context';
import { getAllArtists, searchArtists } from '@/lib/database';
import { 
  Search, 
  MapPin, 
  Star, 
  DollarSign, 
  Calendar,
  Filter,
  Heart,
  MessageCircle,
  
} from 'lucide-react';

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
    avatar_url: string;
    email: string;
  };
}

function BrowseArtistsContent() {
  const { user } = useAuth();
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 200]);

  // Fetch all artists on component mount
  useEffect(() => {
    const fetchArtists = async () => {
      try {
        setLoading(true);
        console.log('Fetching artists...');
        const artistsData = await getAllArtists();
        console.log('Artists fetched:', artistsData);
        setArtists(artistsData || []);
      } catch (error) {
        console.error('Error fetching artists:', error);
        setArtists([]);
      } finally {
        setLoading(false);
      }
    };

    fetchArtists();
  }, []);

  // Search function
  const handleSearch = async () => {
    try {
      setLoading(true);
      
      const filters: any = {};
      if (selectedSpecialty) {
        filters.specialties = [selectedSpecialty];
      }
      if (priceRange[1] < 200) {
        filters.maxRate = priceRange[1];
      }

      const searchResults = await searchArtists(searchTerm, filters);
      setArtists(searchResults || []);
    } catch (error) {
      console.error('Error searching artists:', error);
      setArtists([]);
    } finally {
      setLoading(false);
    }
  };

  // Get all unique specialties for filter
  const allSpecialties = Array.from(
    new Set(artists.flatMap(artist => artist.specialties))
  );

  const resetFilters = async () => {
    setSearchTerm('');
    setSelectedSpecialty('');
    setPriceRange([0, 200]);
    
    try {
      setLoading(true);
      const allArtists = await getAllArtists();
      setArtists(allArtists || []);
    } catch (error) {
      console.error('Error fetching all artists:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <CustomerLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading amazing artists...</p>
          </div>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Your Perfect Artist</h1>
          <p className="text-gray-600">Discover talented tattoo artists and book your next masterpiece</p>
        </div>

        {/* Search and Filters */}
        <Card className="p-6">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search artists, specialties, or styles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">Filters:</span>
              </div>

              {/* Specialty Filter */}
              <select
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm"
              >
                <option value="">All Specialties</option>
                {allSpecialties.map(specialty => (
                  <option key={specialty} value={specialty}>{specialty}</option>
                ))}
              </select>

              {/* Price Range */}
              <div className="flex items-center space-x-2">
                <span className="text-sm">Price: $</span>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                  className="w-20"
                />
                <span className="text-sm">{priceRange[1]}/hr</span>
              </div>

              {/* Action Buttons */}
              <Button onClick={handleSearch} size="sm">
                Search
              </Button>
              <Button onClick={resetFilters} variant="outline" size="sm">
                Reset
              </Button>
            </div>
          </div>
        </Card>

        {/* Results Count */}
        <div className="flex items-center justify-between">
          <p className="text-gray-600">
            {artists.length} artist{artists.length !== 1 ? 's' : ''} found
          </p>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span>Sort by:</span>
            <select className="border border-gray-300 rounded px-2 py-1">
              <option>Rating</option>
              <option>Price (Low to High)</option>
              <option>Price (High to Low)</option>
              <option>Most Reviews</option>
            </select>
          </div>
        </div>

        {/* Artists Grid */}
        {artists.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="text-gray-400 mb-4">
              <Search className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No artists found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search criteria or filters</p>
            <Button onClick={resetFilters} variant="outline">
              View All Artists
            </Button>
          </Card>
        ) : (
          // In your browse page, remove the duplicate key and fix the structure:
<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
  {artists.map((artist) => (
    <Link href={`/customer/artist/${artist.id}`} key={artist.id} className="block">
      <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden">
        <CardContent className="p-0">
          {/* Portfolio Image */}
          <div className="aspect-square overflow-hidden relative">
            <img 
              src={artist.portfolio_images[0] || artist.user_profiles.avatar_url} 
              alt={`${artist.user_profiles.full_name}'s work`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute top-2 right-2">
              <Button 
                size="sm" 
                variant="ghost" 
                className="h-8 w-8 p-0 bg-white/80 hover:bg-white"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  // Add to favorites logic
                }}
              >
                <Heart className="h-4 w-4" />
              </Button>
            </div>
            {/* Rating Badge */}
            <div className="absolute top-2 left-2">
              <Badge className="bg-black/70 text-white border-0">
                <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                {artist.rating}
              </Badge>
            </div>
          </div>

          {/* Artist Info */}
          <div className="p-4 space-y-3">
            {/* Artist Header */}
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={artist.user_profiles.avatar_url} />
                <AvatarFallback>
                  {artist.user_profiles.full_name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{artist.user_profiles.full_name}</h3>
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-3 w-3 mr-1" />
                  Global • Online
                </div>
              </div>
            </div>

            {/* Specialties */}
            <div className="flex flex-wrap gap-1">
              {artist.specialties.slice(0, 3).map((specialty, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {specialty}
                </Badge>
              ))}
              {artist.specialties.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{artist.specialties.length - 3} more
                </Badge>
              )}
            </div>

            {/* Bio */}
            <p className="text-sm text-gray-600 line-clamp-2">
              {artist.bio}
            </p>

            {/* Stats */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-3">
                <div className="flex items-center">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                  <span className="font-medium">{artist.rating}</span>
                  <span className="text-gray-500 ml-1">({artist.total_reviews})</span>
                </div>
                <div className="flex items-center text-green-600 font-medium">
                  <DollarSign className="h-4 w-4" />
                  {artist.hourly_rate}/hr
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2 pt-2">
              <Button 
                className="flex-1" 
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  window.location.href = `/customer/book/${artist.id}`;
                }}
              >
                <Calendar className="h-4 w-4 mr-1" />
                Book Now
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  // Message logic
                }}
              >
                <MessageCircle className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  ))}
</div>
        )}
      </div>
    </CustomerLayout>
  );
}

export default function BrowseArtistsPage() {
  return <BrowseArtistsContent />;
}
