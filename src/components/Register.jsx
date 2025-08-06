import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { 
  Brain, 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  ArrowRight,
  AlertCircle,
  CheckCircle,
  Shield
} from 'lucide-react';
import toast from 'react-hot-toast';

const Register = ({ setUser, setIsAuthenticated }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Ad soyad gereklidir';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Ad soyad en az 2 karakter olmalıdır';
    }

    if (!formData.email) {
      newErrors.email = 'E-posta adresi gereklidir';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Geçerli bir e-posta adresi giriniz';
    }

    if (!formData.password) {
      newErrors.password = 'Şifre gereklidir';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Şifre en az 6 karakter olmalıdır';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Şifre en az bir büyük harf, bir küçük harf ve bir rakam içermelidir';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Şifre tekrarı gereklidir';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Şifreler eşleşmiyor';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      // Önce email'in zaten kayıtlı olup olmadığını user_emails tablosundan kontrol et
      try {
        const { data: existingEmail, error: checkError } = await supabase
          .from('user_emails')
          .select('email')
          .eq('email', formData.email)
          .maybeSingle();

        if (checkError) {
          console.log('Email check error:', checkError);
        }

        if (existingEmail) {
          toast.error('Bu email adresi zaten kayıtlı. Lütfen giriş yapmayı deneyin.');
          setLoading(false);
          return;
        }
      } catch (error) {
        console.log('Email check catch error:', error);
      }

      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
          },
          emailRedirectTo: `${window.location.origin}/login`
        }
      });

      if (error) {
        console.log('Supabase error:', error);
        console.log('Error message:', error.message);
        console.log('Error code:', error.status);
        console.log('Error details:', error);
        
        // Email zaten kayıtlı hatası - farklı hata mesajlarını kontrol et
        if (error.message.includes('already registered') || 
            error.message.includes('already exists') ||
            error.message.includes('User already registered') ||
            error.message.includes('duplicate key') ||
            error.message.includes('already been registered') ||
            error.message.includes('already been confirmed') ||
            error.message.includes('User already confirmed') ||
            error.message.includes('Email not confirmed') ||
            error.status === 422 ||
            error.status === 400 ||
            error.status === 409) {
          toast.error('Bu email adresi zaten kayıtlı. Lütfen giriş yapmayı deneyin.');
        } else if (error.message.includes('Invalid email')) {
          toast.error('Geçersiz email adresi. Lütfen doğru bir email adresi girin.');
        } else if (error.message.includes('Password')) {
          toast.error('Şifre çok kısa. En az 6 karakter olmalıdır.');
        } else {
          toast.error(`Kayıt hatası: ${error.message}`);
        }
        return;
      }

      // Data kontrolü
      console.log('Supabase signUp response:', data);
      console.log('User data:', data?.user);
      
      if (!data || !data.user) {
        toast.error('Kayıt işlemi başarısız oldu. Lütfen tekrar deneyin.');
        return;
      }

      // Kullanıcı zaten var mı kontrol et - email_confirmed_at kontrolü
      if (data.user && data.user.email_confirmed_at) {
        // Kullanıcı zaten onaylanmış, bu durumda zaten kayıtlı demektir
        toast.error('Bu email adresi zaten kayıtlı. Lütfen giriş yapmayı deneyin.');
        return;
      }

      // Kullanıcı zaten var mı kontrol et - created_at kontrolü
      if (data.user && data.user.created_at) {
        const userCreatedAt = new Date(data.user.created_at);
        const now = new Date();
        const diffInMinutes = (now - userCreatedAt) / (1000 * 60);
        
        // Eğer kullanıcı 5 dakikadan daha eskiyse, muhtemelen zaten var
        if (diffInMinutes > 5) {
          toast.error('Bu email adresi zaten kayıtlı. Lütfen giriş yapmayı deneyin.');
          return;
        }
      }

      // Email confirmation gerekiyorsa
      if (data.user && !data.user.email_confirmed_at) {
        // Yeni kullanıcı kaydı, email onayı bekliyor
        // Email'i user_emails tablosuna ekle (RLS bypass ile)
        try {
          const { error: insertError } = await supabase
            .from('user_emails')
            .insert({
              user_id: data.user.id,
              email: formData.email
            });
          
          if (insertError) {
            console.log('Email insert error:', insertError);
          } else {
            console.log('Email başarıyla user_emails tablosuna eklendi');
          }
        } catch (error) {
          console.log('Email insert catch error:', error);
        }
        
        navigate('/login', { 
          state: { 
            message: 'Hesabınız başarıyla oluşturuldu! Lütfen email adresinizi kontrol edin ve onaylayın.' 
          } 
        });
      } else {
        // Email confirmation gerekmiyorsa (test ortamında)
        // Email'i user_emails tablosuna ekle
        try {
          const { error: insertError } = await supabase
            .from('user_emails')
            .insert({
              user_id: data.user.id,
              email: formData.email
            });
          
          if (insertError) {
            console.log('Email insert error:', insertError);
          } else {
            console.log('Email başarıyla user_emails tablosuna eklendi');
          }
        } catch (error) {
          console.log('Email insert catch error:', error);
        }
        
        setUser(data.user);
        setIsAuthenticated(true);
        toast.success('Hesabınız başarıyla oluşturuldu!');
        navigate('/');
      }
    } catch (error) {
      toast.error('Kayıt olurken bir hata oluştu');
      console.error('Register error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });

      if (error) {
        // Email zaten kayıtlı hatası
        if (error.message.includes('already registered') || error.message.includes('already exists')) {
          toast.error('Bu email adresi zaten kayıtlı. Lütfen giriş yapmayı deneyin.');
        } else if (error.message.includes('Invalid email')) {
          toast.error('Geçersiz email adresi. Lütfen doğru bir email adresi girin.');
        } else {
          toast.error(error.message);
        }
      }
    } catch (error) {
      toast.error('Google ile kayıt olurken hata oluştu');
    }
  };

  const passwordStrength = () => {
    const password = formData.password;
    if (!password) return 0;
    
    let strength = 0;
    if (password.length >= 6) strength += 1;
    if (/(?=.*[a-z])/.test(password)) strength += 1;
    if (/(?=.*[A-Z])/.test(password)) strength += 1;
    if (/(?=.*\d)/.test(password)) strength += 1;
    if (/(?=.*[!@#$%^&*])/.test(password)) strength += 1;
    
    return strength;
  };

  const getPasswordStrengthColor = () => {
    const strength = passwordStrength();
    if (strength <= 1) return 'bg-red-500';
    if (strength <= 2) return 'bg-orange-500';
    if (strength <= 3) return 'bg-yellow-500';
    if (strength <= 4) return 'bg-blue-500';
    return 'bg-green-500';
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-pattern opacity-30"></div>
      <div className="absolute inset-0">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 w-full max-w-md mx-4 sm:mx-6 lg:mx-8 mt-6">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 rounded-3xl mb-6 shadow-2xl">
            <Brain className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold gradient-text mb-2">Hesap Oluştur</h1>
          <p className="text-gray-300">CFK Academy'ye katılın</p>
        </div>

        {/* Register Form */}
        <div className="card-glass p-8 animate-fade-in-up">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name Field */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-white mb-2">
                Ad Soyad
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={handleChange}
                  className={`input-primary pl-12 ${errors.fullName ? 'border-red-400' : ''}`}
                  placeholder="Adınız ve soyadınız"
                />
                {errors.fullName && (
                  <div className="flex items-center mt-2 text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.fullName}
                  </div>
                )}
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                E-posta Adresi
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`input-primary pl-12 ${errors.email ? 'border-red-400' : ''}`}
                  placeholder="ornek@email.com"
                />
                {errors.email && (
                  <div className="flex items-center mt-2 text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.email}
                  </div>
                )}
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
                Şifre
              </label>
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 flex items-center pointer-events-none z-10">
                  <Lock className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  className={`input-primary pl-12 pr-12 ${errors.password ? 'border-red-400' : ''}`}
                  placeholder="••••••••"
                />
                <div className="absolute right-4 top-0 bottom-0 flex items-center z-10">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <div className="flex items-center mt-2 text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.password}
                  </div>
                )}
              </div>
              
              {/* Password Strength Indicator - Input dışında */}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                          level <= passwordStrength() 
                            ? getPasswordStrengthColor() 
                            : 'bg-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Şifre gücü: {passwordStrength()}/5
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-white mb-2">
                Şifre Tekrarı
              </label>
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 flex items-center pointer-events-none">
                  <Shield className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`input-primary pl-12 pr-12 ${errors.confirmPassword ? 'border-red-400' : ''}`}
                  placeholder="••••••••"
                />
                <div className="absolute right-4 top-0 bottom-0 flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <div className="flex items-center mt-2 text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.confirmPassword}
                  </div>
                )}
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start">
              <input
                id="terms"
                type="checkbox"
                required
                className="w-4 h-4 text-purple-600 bg-white/10 border-white/20 rounded focus:ring-purple-500 focus:ring-2 mt-1"
              />
              <label htmlFor="terms" className="ml-2 text-sm text-gray-300">
                <Link to="/terms" className="text-purple-400 hover:text-purple-300">
                  Kullanım şartları
                </Link>
                {' '}ve{' '}
                <Link to="/privacy" className="text-purple-400 hover:text-purple-300">
                  gizlilik politikası
                </Link>
                nı kabul ediyorum
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Hesap oluşturuluyor...
                </div>
              ) : (
                <>
                  Hesap Oluştur
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-slate-900 text-gray-400">veya</span>
              </div>
            </div>

            {/* Google Sign Up - Temporarily Disabled */}
            <button
              type="button"
              disabled={true}
              className="w-full flex items-center justify-center px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl text-gray-400 font-semibold cursor-not-allowed opacity-50"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google ile Kayıt Ol (Geçici Olarak Devre Dışı)
            </button>
          </form>

          {/* Sign In Link */}
          <div className="mt-8 text-center">
            <p className="text-gray-300">
              Zaten hesabınız var mı?{' '}
              <Link
                to="/login"
                className="text-purple-400 hover:text-purple-300 font-semibold transition-colors duration-200"
              >
                Giriş yapın
              </Link>
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 mb-10 grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-2">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <p className="text-xs text-gray-400">Ücretsiz</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-2">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <p className="text-xs text-gray-400">AI Destekli</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-2">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <p className="text-xs text-gray-400">Güvenli</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register; 