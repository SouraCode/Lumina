import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Feed from './pages/Feed';
import CreatePost from './pages/CreatePost';
import Profile from './pages/Profile';
import UserProfile from './pages/UserProfile';
import Search from './pages/Search';
import Chat from './pages/Chat';
import MessagesList from './pages/MessagesList';
import { Toaster } from 'react-hot-toast';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-neutral-950 text-white selection:bg-primary-500/30 font-inter">
          <Navbar />

          <main className="max-w-5xl mx-auto pt-24 px-4 pb-12">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Signup />} />
              <Route path="/" element={<ProtectedRoute><Feed /></ProtectedRoute>} />
              <Route path="/create" element={<ProtectedRoute><CreatePost /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/user/:id" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
              <Route path="/search" element={<ProtectedRoute><Search /></ProtectedRoute>} />
              <Route path="/messages" element={<ProtectedRoute><MessagesList /></ProtectedRoute>} />
              <Route path="/chat/:id" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
            </Routes>
          </main>
          <Toaster position="bottom-center" toastOptions={{ style: { background: '#111', color: '#fff', border: '1px solid #333' } }} />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
