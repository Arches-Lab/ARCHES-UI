import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Login from './pages/Login';
import MainLayout from './layouts/MainLayout';
import { AuthProvider } from './auth/AuthContext';
import PrivateRoute from './auth/PrivateRoute';

function App() {
  return (
    <AuthProvider>
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
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
