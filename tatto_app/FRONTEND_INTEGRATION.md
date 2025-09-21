# Frontend Integration Guide

## How to Integrate Firebase Auth + Supabase in Your Components

### 1. Authentication Integration

Here's how to integrate Firebase authentication into your existing auth page:

```tsx
// In your auth page (app/auth/page.tsx)
import { useAuth } from '@/lib/auth-context';
import { useAuthOperations } from '@/hooks/useAuth';

export default function AuthPage() {
  const { user, loading: authLoading } = useAuth();
  const { login, signup, loginWithGoogle, loading, error } = useAuthOperations();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({
        email: formData.email,
        password: formData.password
      });
      // User will be redirected automatically via useEffect
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signup({
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        role: 'customer' // or 'artist'
      });
    } catch (err) {
      console.error('Signup failed:', err);
    }
  };

  // Show loading while checking auth state
  if (authLoading) {
    return <div>Loading...</div>;
  }

  // Redirect if already authenticated
  if (user) {
    router.push('/customer/browse');
    return null;
  }

  return (
    // Your existing JSX with updated form handlers
  );
}
```

### 2. Protecting Routes with AuthGuard

```tsx
// Wrap any page that requires authentication
import { AuthGuard } from '@/components/AuthGuard';

export default function ProtectedPage() {
  return (
    <AuthGuard requiredRole="customer">
      <YourPageContent />
    </AuthGuard>
  );
}
```

### 3. Using Authentication State

```tsx
// In any component
import { useAuth } from '@/lib/auth-context';

function MyComponent() {
  const { user, loading, logout } = useAuth();

  if (loading) return <div>Loading...</div>;
  
  if (!user) {
    return <div>Please log in</div>;
  }

  return (
    <div>
      <p>Welcome, {user.displayName || user.email}!</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### 4. Database Operations

```tsx
// Using the database hooks
import { useUserProfile, useArtists, useBookings } from '@/hooks/useDatabase';
import { createBooking } from '@/lib/database';

function BookingComponent() {
  const { profile } = useUserProfile(); // Current user's profile
  const { artists } = useArtists(); // All artists
  const { bookings } = useBookings('customer'); // User's bookings

  const handleCreateBooking = async (artistId: string, date: string) => {
    try {
      const booking = await createBooking({
        customer_id: profile.id,
        artist_id: artistId,
        appointment_date: date,
        duration_hours: 2,
        status: 'pending'
      });
      console.log('Booking created:', booking);
    } catch (error) {
      console.error('Failed to create booking:', error);
    }
  };

  return (
    <div>
      {artists.map(artist => (
        <div key={artist.id}>
          <h3>{artist.user_profiles?.full_name}</h3>
          <button onClick={() => handleCreateBooking(artist.id, '2025-09-25')}>
            Book Now
          </button>
        </div>
      ))}
    </div>
  );
}
```

### 5. Form Validation with Real Auth

```tsx
// Enhanced form with validation
function LoginForm() {
  const { login, loading, error, clearError } = useAuthOperations();
  const [formData, setFormData] = useState({ email: '', password: '' });

  return (
    <form onSubmit={async (e) => {
      e.preventDefault();
      try {
        await login(formData);
      } catch (err) {
        // Error is handled by the hook
      }
    }}>
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      <input
        type="email"
        value={formData.email}
        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
        required
      />
      
      <input
        type="password"
        value={formData.password}
        onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
        required
      />
      
      <button type="submit" disabled={loading}>
        {loading ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  );
}
```

### 6. Real-time Data Updates

```tsx
// Component that updates when data changes
function ArtistsList() {
  const { artists, loading, error, refetch } = useArtists();

  useEffect(() => {
    // Refetch data when component mounts
    refetch();
  }, []);

  if (loading) return <div>Loading artists...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {artists.map(artist => (
        <ArtistCard key={artist.id} artist={artist} />
      ))}
      <button onClick={refetch}>Refresh</button>
    </div>
  );
}
```

### 7. Conditional Rendering Based on Auth

```tsx
function Navigation() {
  const { user } = useAuth();

  return (
    <nav>
      {user ? (
        <>
          <Link href="/customer/browse">Browse</Link>
          <Link href="/customer/bookings">My Bookings</Link>
          <LogoutButton />
        </>
      ) : (
        <>
          <Link href="/auth">Login</Link>
          <Link href="/auth?mode=signup">Sign Up</Link>
        </>
      )}
    </nav>
  );
}
```

## Key Integration Points:

1. **AuthProvider**: Wrap your app in `layout.tsx` ✅
2. **AuthGuard**: Protect pages that require authentication
3. **useAuth**: Access current user state anywhere
4. **useAuthOperations**: Handle login/signup operations
5. **Database Hooks**: Easy data fetching with authentication
6. **Error Handling**: Built-in error states for auth operations

## Next Steps:

1. Update your existing auth page with the new hooks
2. Add AuthGuard to protected routes
3. Test authentication flow
4. Set up your Firebase and Supabase projects
5. Add environment variables
6. Run the database schema in Supabase

The integration is now ready - you just need to replace the mock authentication in your existing pages with the real Firebase Auth hooks!