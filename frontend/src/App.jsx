import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Feed from './pages/Feed';
import CreatePost from './pages/CreatePost';
import Profile from './pages/Profile';
import UserProfile from './pages/UserProfile';
import Search from './pages/Search';
import Explore from './pages/Explore';
import Chat from './pages/Chat';
import MessagesList from './pages/MessagesList';
import { Toaster } from 'react-hot-toast';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  return children;
};

const PageWrapper = ({ children }) => (
  <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.3 }}>
    {children}
  </motion.div>
);

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
        <Route path="/register" element={<PageWrapper><Signup /></PageWrapper>} />
        <Route path="/" element={<ProtectedRoute><PageWrapper><Feed /></PageWrapper></ProtectedRoute>} />
        <Route path="/create" element={<ProtectedRoute><PageWrapper><CreatePost /></PageWrapper></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><PageWrapper><Profile /></PageWrapper></ProtectedRoute>} />
        <Route path="/user/:id" element={<ProtectedRoute><PageWrapper><UserProfile /></PageWrapper></ProtectedRoute>} />
        <Route path="/search" element={<ProtectedRoute><PageWrapper><Search /></PageWrapper></ProtectedRoute>} />
        <Route path="/explore" element={<ProtectedRoute><PageWrapper><Explore /></PageWrapper></ProtectedRoute>} />
        <Route path="/messages" element={<ProtectedRoute><PageWrapper><MessagesList /></PageWrapper></ProtectedRoute>} />
        <Route path="/chat/:id" element={<ProtectedRoute><PageWrapper><Chat /></PageWrapper></ProtectedRoute>} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-neutral-950 text-white selection:bg-primary-500/30 font-inter">
          <Navbar />

          {/* main container shifted right for desktop sidebar and padded for mobile top/bottom bars */}
          <main className="md:ml-64 pt-16 pb-20 md:pt-8 md:pb-8 px-4 flex justify-center min-h-screen">
            <div className="w-full max-w-2xl">
              <AnimatedRoutes />
            </div>
          </main>
          <Toaster position="bottom-center" toastOptions={{ style: { background: '#111', color: '#fff', border: '1px solid #333' } }} />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
