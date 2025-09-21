# Firebase Auth + Supabase Database Integration Guide

This guide will help you set up Firebase Authentication and Supabase Database for your tattoo booking application.

## 📋 Prerequisites

1. **Firebase Project**: Create a project at [Firebase Console](https://console.firebase.google.com/)
2. **Supabase Project**: Create a project at [Supabase](https://supabase.com/)

## 🔥 Firebase Setup

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Follow the setup wizard

### 2. Enable Authentication
1. In Firebase Console, go to "Authentication" → "Sign-in method"
2. Enable the following providers:
   - **Email/Password**: Enable this
   - **Google**: Enable and configure OAuth consent screen
3. Copy your Firebase config values

### 3. Firebase Configuration
Your Firebase project settings should provide these values:
```
API Key: your_firebase_api_key
Auth Domain: your_project_id.firebaseapp.com
Project ID: your_project_id
Storage Bucket: your_project_id.appspot.com
Messaging Sender ID: your_messaging_sender_id
App ID: your_app_id
```

## 🗄️ Supabase Setup

### 1. Create Supabase Project
1. Go to [Supabase](https://supabase.com/)
2. Create a new project
3. Choose a region close to your users
4. Wait for the project to be ready

### 2. Set Up Database Schema
1. Go to your Supabase project dashboard
2. Navigate to "SQL Editor"
3. Copy and run the SQL from `supabase-schema.sql` file
4. This creates all necessary tables with proper relationships and security policies

### 3. Get Supabase Configuration
1. Go to Project Settings → API
2. Copy these values:
   - **Project URL**: Your unique Supabase URL
   - **Anon/Public Key**: For client-side operations
   - **Service Role Key**: For server-side operations (keep secret!)

## ⚙️ Environment Configuration

### 1. Update Environment Variables
Edit `.env.local` file with your actual values:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_actual_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_actual_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_actual_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_actual_app_id

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_actual_service_role_key
```

### 2. Security Notes
- Never commit `.env.local` to version control
- The service role key should only be used server-side
- Use the anon key for client-side operations

## 🚀 Usage Examples

### Authentication
```tsx
import { useAuth } from '@/lib/auth-context';
import { useAuthOperations } from '@/hooks/useAuth';

function LoginForm() {
  const { login } = useAuthOperations();
  
  const handleLogin = async (email: string, password: string) => {
    try {
      await login({ email, password });
      // User is now logged in
    } catch (error) {
      // Handle error
    }
  };
}
```

### Database Operations
```tsx
import { useUserProfile, useArtists } from '@/hooks/useDatabase';
import { createBooking } from '@/lib/database';

function BookingForm({ artistId }: { artistId: string }) {
  const { profile } = useUserProfile();
  
  const handleBooking = async (appointmentData: any) => {
    if (!profile) return;
    
    try {
      const booking = await createBooking({
        customer_id: profile.id,
        artist_id: artistId,
        appointment_date: appointmentData.date,
        duration_hours: appointmentData.duration,
        description: appointmentData.description,
        status: 'pending'
      });
      // Booking created successfully
    } catch (error) {
      // Handle error
    }
  };
}
```

## 🛡️ Security Features

### Firebase Auth Features
- Email/password authentication
- Google OAuth integration
- Password reset functionality
- User session management

### Supabase Security
- Row Level Security (RLS) enabled
- Users can only access their own data
- Artists can manage their profiles and bookings
- Customers can create bookings and reviews

## 📊 Database Schema

### Core Tables
1. **user_profiles**: Basic user information
2. **artists**: Extended artist profiles with specialties and rates
3. **bookings**: Appointment bookings between customers and artists
4. **reviews**: Customer reviews for completed bookings

### Key Relationships
- Users → Artists (one-to-one for artist users)
- Customers → Bookings (one-to-many)
- Artists → Bookings (one-to-many)
- Bookings → Reviews (one-to-one)

## 🔧 Testing the Integration

1. **Start Development Server**:
   ```bash
   npm run dev
   ```

2. **Test Authentication**:
   - Visit `/auth` page
   - Try signing up with email/password
   - Test Google OAuth login

3. **Test Database Operations**:
   - Create user profiles
   - Browse artists
   - Create test bookings

## 🐛 Troubleshooting

### Common Issues

1. **Firebase Auth Errors**:
   - Check if authentication is enabled in Firebase Console
   - Verify environment variables are correct
   - Ensure domain is authorized in Firebase settings

2. **Supabase Connection Issues**:
   - Verify project URL and keys
   - Check if RLS policies allow your operations
   - Ensure tables are created correctly

3. **CORS Issues**:
   - Add your domain to Firebase authorized domains
   - Check Supabase CORS settings

### Debug Tips
- Check browser console for errors
- Use Firebase Auth emulator for local testing
- Use Supabase dashboard to verify data operations
- Check Network tab for API call failures

## 📚 Next Steps

After successful integration, consider:

1. **Add more authentication providers** (Facebook, Apple, etc.)
2. **Implement real-time features** with Supabase subscriptions
3. **Add file upload** for portfolio images using Supabase Storage
4. **Set up email notifications** for booking confirmations
5. **Add payment integration** (Stripe, PayPal)
6. **Implement push notifications** for appointment reminders

## 🔗 Useful Links

- [Firebase Documentation](https://firebase.google.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Authentication Patterns](https://nextjs.org/docs/authentication)
- [React Hook Form](https://react-hook-form.com/) - For form validation