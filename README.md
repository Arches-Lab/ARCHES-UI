# ARCHES UI

This is a React + TypeScript web application scaffolded with Vite. It uses Tailwind CSS for styling, React Router for navigation, and Auth0 for authentication.

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Auth0 Configuration

1. Create an Auth0 account at [auth0.com](https://auth0.com)
2. Create a new Single Page Application
3. Configure the following settings in your Auth0 application:
   - **Allowed Callback URLs**: `http://localhost:5173` (for development)
   - **Allowed Logout URLs**: `http://localhost:5173`
   - **Allowed Web Origins**: `http://localhost:5173`

4. Create a `.env` file in the root directory with your Auth0 credentials:
```env
VITE_AUTH0_DOMAIN=your-domain.auth0.com
VITE_AUTH0_CLIENT_ID=your-client-id
VITE_AUTH0_AUDIENCE=your-api-identifier
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

This application uses Auth0 for authentication. The authentication flow includes:

- **Login**: Users are redirected to Auth0's universal login page
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
