import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { supabase } from './lib/supabaseClient';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './components/HomePage';
import Login from './components/Login';
import Register from './components/Register';
import Chat from './components/Chat';
import Exams from './components/Exams';
import TestsPage from './components/TestsPage';
import ProfilePage from './components/ProfilePage';
import StatisticPage from "./components/StatisticPage";
import LoadingScreen from './components/LoadingScreen';
import ScrollToTopButton from './components/ScrollToTopButton';
import NotFound from './components/NotFound';

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Chat sayfasında scroll pozisyonunu koru
    if (pathname !== '/chat') {
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  return null;
}

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        setIsAuthenticated(!!user);
      } catch (error) {
        console.error('Error getting user:', error);
      } finally {
        setLoading(false);
      }
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        setIsAuthenticated(!!session?.user);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Protected Route Component
  const ProtectedRoute = ({ children }) => {
    if (loading) {
      return <LoadingScreen />;
    }
    
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }
    
    return children;
  };

  // Public Route Component (redirects if already authenticated)
  const PublicRoute = ({ children }) => {
    if (loading) {
      return <LoadingScreen />;
    }
    
    if (isAuthenticated) {
      return <Navigate to="/" replace />;
    }
    
    return children;
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
        {/* Animated Background */}
        <div className="fixed inset-0 bg-pattern opacity-30"></div>
        <div className="absolute inset-0">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>
        
        {/* Main Content */}
        <div className="relative z-10">
          <Navbar user={user} setUser={setUser} isAuthenticated={isAuthenticated} />
          
          <main className="pt-20 min-h-screen">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage user={user} isAuthenticated={isAuthenticated} />} />
              
              {/* Auth Routes */}
              <Route 
                path="/login" 
                element={
                  <PublicRoute>
                    <Login setUser={setUser} setIsAuthenticated={setIsAuthenticated} />
                  </PublicRoute>
                } 
              />
              <Route 
                path="/register" 
                element={
                  <PublicRoute>
                    <Register setUser={setUser} setIsAuthenticated={setIsAuthenticated} />
                  </PublicRoute>
                } 
              />
              
              {/* Protected Routes */}
              <Route 
                path="/chat" 
                element={
                  <ProtectedRoute>
                    <Chat user={user} />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/exams" 
                element={
                  <ProtectedRoute>
                    <Exams user={user} />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/tests" 
                element={
                  <ProtectedRoute>
                    <TestsPage user={user} />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/statistics" 
                element={
                  <ProtectedRoute>
                    <StatisticPage user={user} />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <ProfilePage user={user} />
                  </ProtectedRoute>
                } 
              />
              
              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          
          <Footer />
        </div>
        
        {/* Scroll to Top Button */}
        <ScrollToTopButton />
        
        {/* Toast Notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: 'white',
              borderRadius: '16px',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: 'white',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: 'white',
              },
            },
          }}
        />
      </div>
    </Router>
  );
}

export default App;
