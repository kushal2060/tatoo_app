'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Palette, 
  BarChart3, 
  Calendar, 
  User, 
  Settings, 
  LogOut, 
  Menu,
  Bell,
  Paintbrush,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useAuthOperations } from '@/hooks/useAuth';
import { getUserProfile } from '@/lib/database';

interface ArtistLayoutProps {
  children: React.ReactNode;
}

export default function ArtistLayout({ children }: ArtistLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const { user } = useAuth();
  const { logout, loading: logoutLoading } = useAuthOperations();

  // Check if user is an artist
  useEffect(() => {
    const checkUserRole = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const profile = await getUserProfile(user.uid);
        
        if (!profile) {
          console.error('No user profile found');
          setLoading(false);
          return;
        }

        setUserProfile(profile);
      } catch (error) {
        console.error('Error checking user role:', error);
      } finally {
        setLoading(false);
      }
    };

    checkUserRole();
  }, [user, router]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/auth');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails, redirect to auth page
      router.push('/auth');
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-600" />
          <p className="text-gray-600">Verifying artist access...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if not an artist - just return null
  if (!user || !userProfile || userProfile.role !== 'artist') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
            <p className="text-gray-600"> User not authenticated as an artist. Please <Link href="/auth" className="text-purple-600 hover:underline">login</Link> with an artist account.
            </p>
          </div>
        </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <Palette className="h-8 w-8 text-purple-600" />
              <span className="text-xl font-bold text-gray-900">Tattoist</span>
              <Badge className="bg-purple-100 text-purple-700 text-xs">Artist</Badge>
            </Link>

           
            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
              
              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={userProfile.avatar_url} />
                  <AvatarFallback className="bg-purple-100 text-purple-600">
                    {userProfile.full_name ? userProfile.full_name.split(' ').map((n: string) => n[0]).join('') : <Paintbrush className="h-4 w-4" />}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden md:block text-sm font-medium">
                  {userProfile.full_name || 'Artist'}
                </span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleLogout}
                  disabled={logoutLoading}
                >
                  {logoutLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <LogOut className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {/* Mobile menu button */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="md:hidden">
                    <Menu className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <div className="flex items-center space-x-3 mb-8">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={userProfile.avatar_url} />
                      <AvatarFallback className="bg-purple-100 text-purple-600">
                        {userProfile.full_name ? userProfile.full_name.split(' ').map((n: string) => n[0]).join('') : <Paintbrush className="h-4 w-4" />}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{userProfile.full_name || 'Artist'}</p>
                      <p className="text-sm text-gray-600">{userProfile.email}</p>
                    </div>
                  </div>
                  
                  <nav className="flex flex-col space-y-4">
                    <Link 
                      href="/artist" 
                      className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                        pathname === '/artist' ? 'bg-purple-50 text-purple-600' : 'text-gray-600 hover:bg-gray-50'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <BarChart3 className="h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                    <Link 
                      href="/artist/bookings" 
                      className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                        pathname === '/artist/bookings' ? 'bg-purple-50 text-purple-600' : 'text-gray-600 hover:bg-gray-50'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Calendar className="h-4 w-4" />
                      <span>Bookings</span>
                    </Link>
                    <Link 
                      href="/artist/profile" 
                      className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                        pathname === '/artist/profile' ? 'bg-purple-50 text-purple-600' : 'text-gray-600 hover:bg-gray-50'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <User className="h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                    
                    <hr className="my-4" />
                    
                    <Button 
                      variant="ghost" 
                      className="justify-start px-3 text-gray-600"
                      onClick={handleLogout}
                      disabled={logoutLoading}
                    >
                      {logoutLoading ? (
                        <Loader2 className="h-4 w-4 mr-3 animate-spin" />
                      ) : (
                        <LogOut className="h-4 w-4 mr-3" />
                      )}
                      Logout
                    </Button>
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}