import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Auth0Provider } from '@auth0/auth0-react';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Employees from './pages/Employees';
import MainLayout from './layouts/MainLayout';
import { AuthProvider } from './auth/AuthContext';
import { StoreProvider } from './auth/StoreContext';
import PrivateRoute from './auth/PrivateRoute';

function App() {
  const domain = import.meta.env.VITE_AUTH0_DOMAIN;
  const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
  const audience = import.meta.env.VITE_AUTH0_AUDIENCE;

  // Debug logging
  console.log('Auth0 Config:', { domain, clientId, audience });

  if (!domain || !clientId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Configuration Error</h1>
          <p className="text-gray-600">
            Auth0 configuration is missing. Please check your .env.local file.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Required: VITE_AUTH0_DOMAIN, VITE_AUTH0_CLIENT_ID
          </p>
        </div>
      </div>
    );
  }

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: audience,
        scope: 'openid profile email'
      }}
      cacheLocation="localstorage"
      useRefreshTokens={true}
    >
      <AuthProvider>
        <StoreProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/"
                element={
                  <PrivateRoute>
                    <MainLayout />
                  </PrivateRoute>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="profile" element={<Profile />} />
                <Route path="settings" element={<Settings />} />
                <Route path="employees" element={<Employees />} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </StoreProvider>
      </AuthProvider>
    </Auth0Provider>
  );
}

export default App;
