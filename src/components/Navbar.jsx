import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Brain, 
  Menu, 
  X, 
  User, 
  LogOut, 
  Settings, 
  BarChart3,
  BookOpen,
  MessageSquare,
  FileText,
  Home,
  ChevronDown
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import toast from 'react-hot-toast';

const Navbar = ({ user, setUser, isAuthenticated }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('username, avatar_url')
            .eq('id', user.id)
            .single();

          if (error) {
            console.error('Profil verisi alınamadı:', error.message);
            // If no profile data, use user metadata
            setUserProfile({
              username: user.user_metadata?.full_name,
              avatar_url: null
            });
          } else {
            // If no username in profile, use full_name from metadata
            setUserProfile({
              ...data,
              username: data.username || user.user_metadata?.full_name
            });
          }
        } catch (error) {
          console.error('Profil yüklenirken hata:', error);
          // Fallback to user metadata
          setUserProfile({
            username: user.user_metadata?.full_name,
            avatar_url: null
          });
        }
      }
    };

    fetchUserProfile();
  }, [user]);

  // Sayfa değiştiğinde dropdown'ları kapat
  useEffect(() => {
    setIsProfileOpen(false);
    setIsMenuOpen(false);
  }, [location.pathname]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      toast.success('Başarıyla çıkış yapıldı');
    } catch (error) {
      toast.error('Çıkış yapılırken hata oluştu');
    }
  };

  const navItems = [
    { name: 'Ana Sayfa', path: '/', icon: Home },
    { name: 'AI Chat', path: '/chat', icon: MessageSquare, protected: true },
    { name: 'Sınavlar', path: '/exams', icon: FileText, protected: true },
    { name: 'Denemeler', path: '/tests', icon: BookOpen, protected: true },
    { name: 'İstatistikler', path: '/statistics', icon: BarChart3, protected: true },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[9999] transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/30 backdrop-blur-3xl border-b border-white/40 shadow-2xl' 
        : 'bg-transparent'
    }`}>
      <div className="container-responsive mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-glow transition-all duration-300">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full animate-ping"></div>
            </div>
            <div className="hidden md:block">
              <h1 className="text-xl font-bold gradient-text">CFK Academy</h1>
              <p className="text-xs text-gray-400">AI Destekli Öğrenme</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden xl:flex items-center space-x-8">
            {navItems.map((item) => {
              if (item.protected && !isAuthenticated) return null;
              
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-2xl transition-all duration-300 hover:bg-white/10 ${
                    isActive(item.path) 
                      ? 'bg-white/20 text-white' 
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* User Menu / Auth Buttons */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl hover:bg-white/20 transition-all duration-300"
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden">
                    {userProfile?.avatar_url ? (
                      <img
                        src={userProfile.avatar_url}
                        alt="Profil"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                  <span className="hidden md:block text-sm font-medium">
                    {userProfile?.username || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Kullanıcı'}
                  </span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {/* Profile Dropdown */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-black/80 md:bg-white/5 backdrop-blur-3xl border border-white/20 rounded-2xl shadow-2xl py-2">
                    <Link
                      to="/profile"
                      className="flex items-center space-x-3 px-4 py-3 hover:bg-white/10 transition-all duration-200 text-white md:text-gray-300"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <User className="w-5 h-5" />
                      <span>Profil</span>
                    </Link>
                    <div className="border-t border-white/10 my-2"></div>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center space-x-3 px-4 py-3 hover:bg-white/10 transition-all duration-200 w-full text-left text-white md:text-gray-300"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>Çıkış Yap</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="btn-secondary text-sm px-4 py-2"
                >
                  Giriş Yap
                </Link>
                <Link
                  to="/register"
                  className="btn-primary text-sm px-4 py-2"
                >
                  Kayıt Ol
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="xl:hidden p-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl hover:bg-white/20 transition-all duration-300"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMenuOpen && (
          <div className="xl:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]" onClick={() => setIsMenuOpen(false)}>
                        <div className="absolute top-24 left-4 right-4 bg-black/80 backdrop-blur-3xl border border-white/20 rounded-3xl p-4 animate-slide-down shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-white">Menü</h3>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-xl transition-all duration-200"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
              <div className="space-y-2">
              {navItems.map((item) => {
                if (item.protected && !isAuthenticated) return null;
                
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-300 ${
                      isActive(item.path) 
                        ? 'bg-white/20 text-white' 
                        : 'text-white/80 hover:bg-white/10 hover:text-white'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                );
              })}
              
              {isAuthenticated && (
                <>
                  <div className="border-t border-white/10 my-2"></div>
                  <Link
                    to="/profile"
                    className="flex items-center space-x-3 px-4 py-3 rounded-2xl text-white/80 hover:bg-white/10 hover:text-white transition-all duration-300"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="w-5 h-5" />
                    <span>Profil</span>
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center space-x-3 px-4 py-3 rounded-2xl text-white/80 hover:bg-white/10 hover:text-white transition-all duration-300 w-full text-left"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Çıkış Yap</span>
                  </button>
                </>
              )}
            </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 