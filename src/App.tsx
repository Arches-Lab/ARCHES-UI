import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Login from './components/Login';
import Employees from './pages/Employees';
import NewUser from './pages/NewUser';
import Messages from './pages/Messages';
import Leads from './pages/Leads';
import LeadDetails from './pages/LeadDetails';
import Mailboxes from './pages/Mailboxes';
import Tasks from './pages/Tasks';
import TaskDetail from './pages/TaskDetail';
import MainLayout from './layouts/MainLayout';
import { AuthProvider } from './auth/AuthContext';
import { StoreProvider } from './auth/StoreContext';
import PrivateRoute from './auth/PrivateRoute';

function App() {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  // Debug logging
  console.log('Supabase Config:', { supabaseUrl, supabaseAnonKey: supabaseAnonKey ? '***' : undefined });

  if (!supabaseUrl || !supabaseAnonKey) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Configuration Error</h1>
          <p className="text-gray-600">
            Supabase configuration is missing. Please check your .env.local file.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Required: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
          </p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <AuthProvider>
        <StoreProvider>
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
              <Route path="newuser" element={<NewUser />} />
              <Route path="messages" element={<Messages />} />
              <Route path="leads" element={<Leads />} />
              <Route path="leads/:leadId" element={<LeadDetails />} />
              <Route path="mailboxes" element={<Mailboxes />} />
              <Route path="tasks" element={<Tasks />} />
              <Route path="tasks/:taskId" element={<TaskDetail />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </StoreProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
