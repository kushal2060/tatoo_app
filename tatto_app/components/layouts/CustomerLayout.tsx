// 'use client';

// import { useState } from 'react';
// import Link from 'next/link';
// import { useRouter, usePathname } from 'next/navigation';
// import { Button } from '@/components/ui/button';
// import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
// import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
// import { Badge } from '@/components/ui/badge';
// import { 
//   Palette, 
//   Search, 
//   Calendar, 
//   History, 
//   User, 
//   LogOut, 
//   Menu,
//   Bell
// } from 'lucide-react';

// const navigation = [
//   { name: 'Browse Artists', href: '/customer/browse', icon: Search },
//   { name: 'My Bookings', href: '/customer/bookings', icon: Calendar },

//   { name: 'Profile', href: '/customer/profile', icon: User },
// ];

// interface CustomerLayoutProps {
//   children: React.ReactNode;
// }

// export default function CustomerLayout({ children }: CustomerLayoutProps) {
//   const router = useRouter();
//   const pathname = usePathname();
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

//   const handleLogout = () => {
//     localStorage.removeItem('userRole');
//     localStorage.removeItem('isAuthenticated');
//     router.push('/');
//   };

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Header */}
//       <header className="bg-white shadow-sm border-b">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex justify-between items-center h-16">
//             {/* Logo */}
//             <Link href="/" className="flex items-center space-x-2">
//               <Palette className="h-8 w-8 text-purple-600" />
//               <span className="text-xl font-bold text-gray-900">Tattoist</span>
//                <Badge className="bg-purple-100 text-purple-700 text-xs">Customer</Badge>
//             </Link>

//             {/* Desktop Navigation */}
//             <nav className="hidden md:flex space-x-8">
//               {navigation.map((item) => {
//                 const Icon = item.icon;
//                 return (
//                   <Link
//                     key={item.name}
//                     href={item.href}
//                     className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
//                       pathname === item.href
//                         ? 'text-purple-600 bg-purple-50'
//                         : 'text-gray-700 hover:text-purple-600'
//                     }`}
//                   >
//                     <Icon className="h-4 w-4" />
//                     <span>{item.name}</span>
//                   </Link>
//                 );
//               })}
//             </nav>

//             {/* User Menu */}
//             <div className="flex items-center space-x-4">
//               <Button variant="ghost" size="sm">
//                 <Bell className="h-4 w-4" />
//               </Button>
              
//               <div className="flex items-center space-x-3">
//                 <Avatar className="h-8 w-8">
//                   <AvatarImage src="https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=100" />
//                   <AvatarFallback>JD</AvatarFallback>
//                 </Avatar>
//                 <span className="hidden md:block text-sm font-medium">John Doe</span>
//                 <Button variant="ghost" size="sm" onClick={handleLogout}>
//                   <LogOut className="h-4 w-4" />
//                 </Button>
//               </div>

//               {/* Mobile menu button */}
//               <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
//                 <SheetTrigger asChild>
//                   <Button variant="ghost" size="sm" className="md:hidden">
//                     <Menu className="h-4 w-4" />
//                   </Button>
//                 </SheetTrigger>
//                 <SheetContent>
//                   <nav className="flex flex-col space-y-4 mt-8">
//                     {navigation.map((item) => {
//                       const Icon = item.icon;
//                       return (
//                         <Link
//                           key={item.name}
//                           href={item.href}
//                           onClick={() => setMobileMenuOpen(false)}
//                           className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
//                             pathname === item.href
//                               ? 'text-purple-600 bg-purple-50'
//                               : 'text-gray-700 hover:text-purple-600'
//                           }`}
//                         >
//                           <Icon className="h-5 w-5" />
//                           <span>{item.name}</span>
//                         </Link>
//                       );
//                     })}
//                     <hr />
//                     <Button variant="ghost" onClick={handleLogout} className="justify-start">
//                       <LogOut className="h-5 w-5 mr-3" />
//                       Logout
//                     </Button>
//                   </nav>
//                 </SheetContent>
//               </Sheet>
//             </div>
//           </div>
//         </div>
//       </header>

//       {/* Main Content */}
//       <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         {children}
//       </main>
//     </div>
//   );
// }
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth-context';
import { useAuthOperations } from '@/hooks/useAuth';
import { 
  Palette, 
  Search, 
  Calendar, 
  User, 
  LogOut, 
  Menu,
  Bell
} from 'lucide-react';

const navigation = [
  { name: 'Browse Artists', href: '/customer/browse', icon: Search },
  { name: 'My Bookings', href: '/customer/bookings', icon: Calendar },
  { name: 'Profile', href: '/customer/profile', icon: User },
];

interface CustomerLayoutProps {
  children: React.ReactNode;
}

export default function CustomerLayout({ children }: CustomerLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const { logout, loading: logoutLoading } = useAuthOperations();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user) return 'G';
    const name = user.displayName || user.email || 'User';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

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
              <Badge className="bg-purple-100 text-purple-700 text-xs">Customer</Badge>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      pathname === item.href
                        ? 'text-purple-600 bg-purple-50'
                        : 'text-gray-700 hover:text-purple-600'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
              
              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.photoURL || undefined} />
                  <AvatarFallback>{getUserInitials()}</AvatarFallback>
                </Avatar>
               
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleLogout}
                  disabled={logoutLoading}
                >
                  {logoutLoading ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
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
                  <div className="flex items-center space-x-3 mb-6 p-3 border-b">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user?.photoURL || undefined} />
                      <AvatarFallback>{getUserInitials()}</AvatarFallback>
                    </Avatar>
                    <div>
                      
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                  </div>
                  
                  <nav className="flex flex-col space-y-4 mt-8">
                    {navigation.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                            pathname === item.href
                              ? 'text-purple-600 bg-purple-50'
                              : 'text-gray-700 hover:text-purple-600'
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                          <span>{item.name}</span>
                        </Link>
                      );
                    })}
                    <hr />
                    <Button 
                      variant="ghost" 
                      onClick={handleLogout} 
                      className="justify-start"
                      disabled={logoutLoading}
                    >
                      {logoutLoading ? (
                        <div className="h-5 w-5 mr-3 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
                      ) : (
                        <LogOut className="h-5 w-5 mr-3" />
                      )}
                      {logoutLoading ? 'Logging out...' : 'Logout'}
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