import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import toast from 'react-hot-toast';

const ProfilePage = ({ user }) => {
  const [username, setUsername] = useState(user?.user_metadata?.full_name || '');
  const [profileImageUrl, setProfileImageUrl] = useState(null);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [updatingPassword, setUpdatingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('avatar_url')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error("Profil verisi alınamadı:", error.message);
    } else {
      if (data?.avatar_url) {
        setProfileImageUrl(`${data.avatar_url}?t=${Date.now()}`);
      }
    }

    setLoading(false);
  };

  const updateProfile = async () => {
    setUpdating(true);
    setMessage(null);

    const updates = {
      id: user.id,
      username,
      avatar_url: profileImageUrl,
      updated_at: new Date(),
    };

    const { error: dbError } = await supabase.from('profiles').upsert(updates);

    const { error: authError } = await supabase.auth.updateUser({
      data: { full_name: username },
    });

    if (dbError || authError) {
      setMessage({
        type: 'error',
        text: dbError?.message || authError?.message || 'Güncelleme sırasında hata oluştu.',
      });
    } else {
      setMessage({ type: 'success', text: 'Profil başarıyla güncellendi.' });
      toast.success('Profiliniz başarıyla güncellendi!');
    }

    setUpdating(false);
  };

  const uploadProfileImage = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    setMessage(null);

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      setMessage({ type: 'error', text: 'Fotoğraf yüklenirken hata oluştu.' });
      console.error('Yükleme hatası:', uploadError.message);
      setUploadingImage(false);
      return;
    }

    const { data: urlData, error: urlError } = supabase
      .storage
      .from('avatars')
      .getPublicUrl(filePath);

    if (urlError) {
      setMessage({ type: 'error', text: 'Fotoğraf URL alınamadı.' });
      console.error('URL alma hatası:', urlError.message);
    } else {
      const fullUrl = `${urlData.publicUrl}?t=${Date.now()}`;
      setProfileImageUrl(fullUrl);
      setMessage({ type: 'success', text: 'Fotoğraf başarıyla yüklendi.' });
      toast.success('Profil fotoğrafınız başarıyla güncellendi!');

      await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          avatar_url: fullUrl,
          updated_at: new Date(),
        });
    }

    setUploadingImage(false);
  };

  const validatePasswordForm = () => {
    const errors = {};

    if (!passwordData.currentPassword) {
      errors.currentPassword = 'Mevcut şifre gereklidir';
    }

    if (!passwordData.newPassword) {
      errors.newPassword = 'Yeni şifre gereklidir';
    } else if (passwordData.newPassword.length < 6) {
      errors.newPassword = 'Şifre en az 6 karakter olmalıdır';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(passwordData.newPassword)) {
      errors.newPassword = 'Şifre en az bir büyük harf, bir küçük harf ve bir rakam içermelidir';
    } else if (passwordData.currentPassword && passwordData.currentPassword === passwordData.newPassword) {
      errors.newPassword = 'Yeni şifre mevcut şifre ile aynı olamaz';
    }

    if (!passwordData.confirmPassword) {
      errors.confirmPassword = 'Şifre tekrarı gereklidir';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Şifreler eşleşmiyor';
    }

    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (passwordErrors[name]) {
      setPasswordErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const updatePassword = async () => {
    if (!validatePasswordForm()) {
      return;
    }

    setUpdatingPassword(true);
    setMessage(null);

    try {
      // Önce mevcut şifreyi doğrula
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: passwordData.currentPassword
      });

      if (signInError) {
        setMessage({ type: 'error', text: 'Mevcut şifre yanlış. Lütfen doğru şifrenizi girin.' });
        setUpdatingPassword(false);
        return;
      }

      // Şifre doğruysa yeni şifreyi güncelle
      const { error: updateError } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (updateError) {
        setMessage({ type: 'error', text: updateError.message });
      } else {
        setMessage({ type: 'success', text: 'Şifre başarıyla güncellendi.' });
        toast.success('Şifreniz başarıyla güncellendi!');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setShowPasswordForm(false);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Şifre güncellenirken hata oluştu.' });
    } finally {
      setUpdatingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center py-8 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-6 animate-float">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Profil Yükleniyor...</h2>
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="card-glass border-0 shadow-2xl rounded-3xl overflow-hidden">
                     {/* Header */}
           <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6">
             <div className="flex items-center space-x-3">
               <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center animate-float">
                 <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                 </svg>
               </div>
               <div>
                 <h1 className="text-2xl font-bold mb-1">Profil Ayarları</h1>
                 <p className="text-purple-100 text-sm">Kişisel bilgilerinizi güncelleyin</p>
               </div>
             </div>
           </div>

                     {/* Content */}
           <div className="p-6">
             {/* Profile Image Section */}
             <div className="text-center mb-6">
               <div className="relative inline-block">
                 <div className="w-24 h-24 rounded-full overflow-hidden shadow-2xl border-4 border-white/20">
                   {profileImageUrl ? (
                     <img
                       src={profileImageUrl}
                       alt="Profil"
                       className="w-full h-full object-cover"
                     />
                   ) : (
                     <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                       <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                       </svg>
                     </div>
                   )}
                 </div>
                 <label
                   htmlFor="upload-avatar"
                   className="absolute -bottom-1 -right-1 w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:scale-110 transition-transform duration-300"
                   title="Fotoğraf Değiştir"
                 >
                   <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                   </svg>
                 </label>
                 <input
                   type="file"
                   id="upload-avatar"
                   accept="image/*"
                   onChange={uploadProfileImage}
                   className="hidden"
                   disabled={uploadingImage}
                 />
               </div>
               {uploadingImage && (
                 <div className="mt-3 flex items-center justify-center space-x-2">
                   <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                   <span className="text-gray-300 text-sm">Yükleniyor...</span>
                 </div>
               )}
             </div>

                         {/* Form Fields */}
             <div className="space-y-4">
               {/* Email Field */}
               <div>
                 <label className="block text-xs font-semibold text-white mb-2">
                   <div className="flex items-center space-x-2">
                     <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                     </svg>
                     <span>E-posta Adresi</span>
                   </div>
                 </label>
                 <div className="relative">
                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                     <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                     </svg>
                   </div>
                   <input
                     type="email"
                     className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-sm"
                     value={user.email}
                     disabled
                   />
                 </div>
               </div>

               {/* Username Field */}
               <div>
                 <label htmlFor="username" className="block text-xs font-semibold text-white mb-2">
                   <div className="flex items-center space-x-2">
                     <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                     </svg>
                     <span>Kullanıcı Adı</span>
                   </div>
                 </label>
                 <div className="relative">
                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                     <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                   </svg>
                   </div>
                   <input
                     id="username"
                     type="text"
                     className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-sm"
                     value={username}
                     onChange={(e) => setUsername(e.target.value)}
                     disabled={updating}
                     placeholder="Kullanıcı adınızı girin"
                   />
                                </div>
             </div>
           </div>

           {/* Password Update Section */}
           <div className="mt-6">
             <div className="flex items-center justify-between mb-4">
               <h3 className="text-lg font-semibold text-white">Şifre Güncelleme</h3>
               <button
                 onClick={() => setShowPasswordForm(!showPasswordForm)}
                 className="text-sm text-purple-400 hover:text-purple-300 transition-colors duration-200"
               >
                 {showPasswordForm ? 'İptal' : 'Şifre Değiştir'}
               </button>
             </div>

             {showPasswordForm && (
               <div className="space-y-4 p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl">
                 {/* Current Password */}
                 <div>
                   <label className="block text-xs font-semibold text-white mb-2">
                     <div className="flex items-center space-x-2">
                       <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                       </svg>
                       <span>Mevcut Şifre</span>
                     </div>
                   </label>
                   <div className="relative">
                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                       <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                       </svg>
                     </div>
                     <input
                       type={showPasswords.current ? 'text' : 'password'}
                       name="currentPassword"
                       value={passwordData.currentPassword}
                       onChange={handlePasswordChange}
                       className={`w-full pl-10 pr-12 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-sm ${
                         passwordErrors.currentPassword ? 'border-red-400' : ''
                       }`}
                       placeholder="Mevcut şifrenizi girin"
                     />
                     <button
                       type="button"
                       onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                       className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200"
                     >
                       {showPasswords.current ? (
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                         </svg>
                       ) : (
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                         </svg>
                       )}
                     </button>
                   </div>
                   {passwordErrors.currentPassword && (
                     <div className="mt-1 text-red-400 text-xs">{passwordErrors.currentPassword}</div>
                   )}
                 </div>

                 {/* New Password */}
                 <div>
                   <label className="block text-xs font-semibold text-white mb-2">
                     <div className="flex items-center space-x-2">
                       <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                       </svg>
                       <span>Yeni Şifre</span>
                     </div>
                   </label>
                   <div className="relative">
                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                       <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                       </svg>
                     </div>
                     <input
                       type={showPasswords.new ? 'text' : 'password'}
                       name="newPassword"
                       value={passwordData.newPassword}
                       onChange={handlePasswordChange}
                       className={`w-full pl-10 pr-12 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-sm ${
                         passwordErrors.newPassword ? 'border-red-400' : ''
                       }`}
                       placeholder="Yeni şifrenizi girin"
                     />
                     <button
                       type="button"
                       onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                       className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200"
                     >
                       {showPasswords.new ? (
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                         </svg>
                       ) : (
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                         </svg>
                       )}
                     </button>
                   </div>
                   {passwordErrors.newPassword && (
                     <div className="mt-1 text-red-400 text-xs">{passwordErrors.newPassword}</div>
                   )}
                 </div>

                 {/* Confirm Password */}
                 <div>
                   <label className="block text-xs font-semibold text-white mb-2">
                     <div className="flex items-center space-x-2">
                       <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.5-4a9 9 0 11-18 0 9 9 0 0118 0z" />
                       </svg>
                       <span>Şifre Tekrarı</span>
                     </div>
                   </label>
                   <div className="relative">
                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                       <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.5-4a9 9 0 11-18 0 9 9 0 0118 0z" />
                       </svg>
                     </div>
                     <input
                       type={showPasswords.confirm ? 'text' : 'password'}
                       name="confirmPassword"
                       value={passwordData.confirmPassword}
                       onChange={handlePasswordChange}
                       className={`w-full pl-10 pr-12 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-sm ${
                         passwordErrors.confirmPassword ? 'border-red-400' : ''
                       }`}
                       placeholder="Yeni şifrenizi tekrar girin"
                     />
                     <button
                       type="button"
                       onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                       className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200"
                     >
                       {showPasswords.confirm ? (
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                         </svg>
                       ) : (
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                         </svg>
                       )}
                     </button>
                   </div>
                   {passwordErrors.confirmPassword && (
                     <div className="mt-1 text-red-400 text-xs">{passwordErrors.confirmPassword}</div>
                   )}
                 </div>

                 {/* Password Update Button */}
                 <div className="pt-2">
                   <button
                     onClick={updatePassword}
                     disabled={updatingPassword}
                     className="w-full btn-primary py-3 text-sm font-bold flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                   >
                     {updatingPassword ? (
                       <>
                         <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                         <span>Güncelleniyor...</span>
                       </>
                     ) : (
                       <>
                         <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                         </svg>
                         <span>Şifreyi Güncelle</span>
                       </>
                     )}
                   </button>
                 </div>
               </div>
             )}
           </div>

           {/* Message Alert */}
             {message && (
               <div className={`mt-4 p-3 rounded-xl border-2 ${
                 message.type === 'success' 
                   ? 'bg-green-500/20 border-green-500/30 text-green-300' 
                   : 'bg-red-500/20 border-red-500/30 text-red-300'
               }`}>
                 <div className="flex items-center space-x-2">
                   <svg className={`w-5 h-5 ${
                     message.type === 'success' ? 'text-green-400' : 'text-red-400'
                   }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     {message.type === 'success' ? (
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                     ) : (
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                     )}
                   </svg>
                   <div>
                     <div className="font-semibold text-sm">
                       {message.type === 'success' ? 'Başarılı!' : 'Hata!'}
                     </div>
                     <div className="text-xs opacity-90">{message.text}</div>
                   </div>
                 </div>
               </div>
             )}

             {/* Update Button */}
             <div className="text-center mt-6">
               <button
                 className="btn-primary px-6 py-3 text-base font-bold flex items-center space-x-2 mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
                 onClick={updateProfile}
                 disabled={updating}
               >
                 {updating ? (
                   <>
                     <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                     <span>Güncelleniyor...</span>
                   </>
                 ) : (
                   <>
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                     </svg>
                     <span>Profili Güncelle</span>
                   </>
                 )}
               </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
