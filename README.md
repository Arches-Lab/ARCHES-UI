# ARCHES UI

This is a React + TypeScript web application scaffolded with Vite. It uses Tailwind CSS for styling, React Router for navigation, and Supabase for authentication.

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Supabase Configuration

1. Create a Supabase account at [supabase.com](https://supabase.com)
2. Create a new project
3. Configure the following settings in your Supabase project:
   - **Authentication**: Enable email/password and OTP authentication
   - **Database**: Set up your database tables as needed

4. Create a `.env` file in the root directory with your Supabase credentials:
```env
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Start Development Server
```bash
npm run dev
```

## Available Scripts

- `npm run dev` - start the development server
- `npm run build` - build for production
- `npm run preview` - preview the production build

## Project Structure

- `src/pages/` – application pages
- `src/components/` – shared UI components
- `src/layouts/` – layout wrappers
- `src/auth/` – authentication context and utilities
- `src/api/` – centralized API logic

## Authentication

This application uses Supabase for authentication. The authentication flow includes:

- **Login**: Users can login with email/password or OTP
- **Protected Routes**: Routes are protected using the `PrivateRoute` component
- **User Profile**: User information is available through the `useAuth` hook
- **Logout**: Users can logout and are redirected back to the application

### Using Authentication in Components

```tsx
import { useAuth } from './auth/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, logout } = useAuth();
  
  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }
  
  return (
    <div>
      <h1>Welcome, {user.name}!</h1>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

This scaffold is ready for further extension with real authentication and API integration.
