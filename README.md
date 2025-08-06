# 🎓 CFK Academy - Yapay Zeka Destekli Öğrenme Platformu

![CFK Academy](https://img.shields.io/badge/CFK-Academy-purple?style=for-the-badge&logo=react)
![React](https://img.shields.io/badge/React-19.1.0-61DAFB?style=for-the-badge&logo=react)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.17-38B2AC?style=for-the-badge&logo=tailwind-css)
![Supabase](https://img.shields.io/badge/Supabase-2.53.0-3ECF8E?style=for-the-badge&logo=supabase)
![Gemini AI](https://img.shields.io/badge/Gemini_AI-2.0_Flash-4285F4?style=for-the-badge&logo=google)
![Vite](https://img.shields.io/badge/Vite-7.0.4-646CFF?style=for-the-badge&logo=vite)

## 🚀 Proje Hakkında

CFK Academy, **YKS ve LGS sınavlarına hazırlanan öğrenciler için yapay zeka destekli modern bir öğrenme platformudur**. Gemini AI entegrasyonu ile kişiselleştirilmiş öğrenme deneyimi sunar ve öğrencilerin başarıya ulaşmasına yardımcı olur.

### 🎯 **Ana Hedefler**
- **YKS Hazırlık**: TYT ve AYT sınavlarına kapsamlı hazırlık
- **LGS Hazırlık**: Liseye geçiş sınavına özel içerikler
- **AI Destekli Öğrenme**: Gemini AI ile anında soru çözümü ve açıklama
- **Kişiselleştirilmiş Deneyim**: Her öğrenciye özel öğrenme yolu
- **Modern Tasarım**: Glass morphism ve gradient efektleri ile çağdaş UI/UX

## ✨ Mevcut Özellikler

### 🤖 **AI Destekli Özellikler**
- **Gemini AI Chat**: Anında soru-cevap sistemi
- **Konu Bazlı Öğrenme**: Sınav türüne göre (TYT/AYT/LGS) özelleştirilmiş içerik
- **Detaylı Açıklamalar**: Adım adım çözümler ve açıklamalar
- **Kişiselleştirilmiş İçerik**: Öğrenci seviyesine göre öneriler
- **Sohbet Geçmişi**: Supabase ile kalıcı konuşma kayıtları

### 📚 **Sınav Hazırlık Sistemi**
- **YKS Konuları**: 
  - **TYT**: Türkçe, Temel Matematik, Sosyal Bilimler, Fen Bilimleri
  - **AYT**: Türk Dili ve Edebiyatı, Matematik, Sosyal Bilimler, Fen Bilimleri
- **LGS Konuları**: Matematik, Fen Bilimleri, Türkçe, Sosyal Bilgiler, T.C. İnkılap Tarihi, Din Kültürü, İngilizce
- **Dinamik Sınav Oluşturma**: AI ile anında sınav oluşturma
- **Zorluk Seviyeleri**: Kolay, Orta, Zor seviyeleri
- **Sınav Simülasyonu**: Gerçek sınav deneyimi
- **Soru Navigasyonu**: Kolay soru geçişi ve işaretleme

### 📊 **Analiz ve Takip**
- **Detaylı İstatistikler**: Performans analizi ve raporlama
- **Sınav Sonuçları**: Başarı oranları ve konu bazlı analiz
- **Zaman Takibi**: Sınav süresi ve performans ölçümü
- **Gelişim Grafikleri**: İlerleme takibi ve görselleştirme

### 🎨 **Modern Tasarım**
- **Glass Morphism**: Cam efekti tasarım ve backdrop blur
- **Gradient Backgrounds**: Purple-Pink-Red kombinasyonu
- **Smooth Animasyonlar**: Blob, shimmer, float efektleri
- **Responsive Design**: Tüm cihazlarda mükemmel görünüm
- **Modern Typography**: Inter font ailesi
- **Dark Theme**: Göz dostu koyu tema

### 🔧 **Teknik Özellikler**
- **React 19**: En son React sürümü ile modern hooks
- **Tailwind CSS**: Utility-first CSS framework
- **Supabase**: Backend, authentication ve real-time database
- **Gemini AI 2.0 Flash**: Google'ın en gelişmiş AI modeli
- **Vite**: Hızlı development server ve build tool
- **Zustand**: State management
- **React Router DOM**: Client-side routing
- **Framer Motion**: Smooth animasyonlar
- **React Hook Form**: Form yönetimi
- **React Hot Toast**: Bildirim sistemi

## 🛠️ Kurulum

### Gereksinimler
- Node.js (v18 veya üzeri)
- npm veya yarn
- Git

### Adımlar

1. **Projeyi klonlayın**
```bash
git clone https://github.com/your-username/cfk-academy.git
cd cfk-academy
```

2. **Bağımlılıkları yükleyin**
```bash
npm install
```

3. **Environment değişkenlerini ayarlayın**
```bash
# .env dosyası oluşturun
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GEMINI_API_KEY=your_gemini_api_key
```

4. **Development server'ı başlatın**
```bash
npm run dev
```

5. **Tarayıcıda açın**
```
http://localhost:5173
```

## 📁 Proje Yapısı

```
CFK/
├── src/
│   ├── components/          # React bileşenleri
│   │   ├── Chat.jsx        # AI Chat sistemi (578 satır)
│   │   ├── HomePage.jsx    # Ana sayfa (313 satır)
│   │   ├── Navbar.jsx      # Navigasyon
│   │   ├── Footer.jsx      # Alt bilgi
│   │   ├── Login.jsx       # Giriş sayfası
│   │   ├── Register.jsx    # Kayıt sayfası
│   │   ├── Exams.jsx       # Sınav sayfası (758 satır)
│   │   ├── TestsPage.jsx   # Test sayfası
│   │   ├── ProfilePage.jsx # Profil sayfası
│   │   ├── StatisticPage.jsx # İstatistik sayfası
│   │   ├── ImageSlider.jsx # Görsel slider
│   │   ├── SoruNavigasyonu.jsx # Soru navigasyonu
│   │   ├── LoadingScreen.jsx # Yükleme ekranı
│   │   ├── ScrollToTopButton.jsx # Yukarı çık butonu
│   │   ├── CountdownTimer.jsx # Geri sayım sayacı
│   │   └── NotFound.jsx    # 404 sayfası
│   ├── api/
│   │   └── gemini.js       # Gemini AI API (53 satır)
│   ├── lib/
│   │   └── supabaseClient.js # Supabase client
│   ├── store/
│   │   └── globalStore.js  # Zustand global state (76 satır)
│   ├── App.jsx            # Ana uygulama (218 satır)
│   ├── main.jsx           # Entry point
│   └── index.css          # Global stiller
├── public/
│   └── favicon.svg        # Site ikonu
├── index.html              # HTML template
├── package.json            # Bağımlılıklar
├── tailwind.config.js      # Tailwind konfigürasyonu
├── vite.config.js          # Vite konfigürasyonu
├── postcss.config.js       # PostCSS konfigürasyonu
├── eslint.config.js        # ESLint konfigürasyonu
└── README.md              # Bu dosya
```

## 🎨 Tasarım Sistemi

### Renkler
- **Primary Gradient**: `from-purple-500 to-pink-500`
- **Secondary Gradient**: `from-purple-400 via-pink-500 to-red-500`
- **Success**: `from-green-400 to-emerald-500`
- **Warning**: `from-yellow-400 to-orange-500`
- **Info**: `from-cyan-400 to-blue-500`
- **Dark**: `from-slate-900 via-purple-900 to-slate-900`

### Tipografi
- **Ana Font**: Inter (300-800 weight)
- **Başlık Boyutları**: text-5xl, text-6xl, text-8xl
- **Modern Spacing**: Rounded-2xl, rounded-3xl

### Bileşenler
- **Cards**: Glass morphism efektleri
- **Buttons**: Gradient arka planlar ve hover animasyonları
- **Navbar**: Backdrop blur ve scroll animasyonları
- **Forms**: Modern input tasarımları ve focus efektleri

## 🔧 API Entegrasyonları

### Supabase
- **Authentication**: Kullanıcı girişi ve kayıt sistemi
- **Database**: 
  - Kullanıcı profilleri
  - Sınav verileri ve sonuçları
  - Chat konuşma geçmişi
  - İstatistikler ve analizler
- **Real-time**: Canlı güncellemeler
- **Storage**: Dosya yükleme ve yönetimi

### Gemini AI
- **Soru-Cevap**: Anında detaylı açıklamalar
- **Konu Bazlı Öğrenme**: Müfredata uygun içerik
- **Adım Adım Çözümler**: Matematik ve fen soruları
- **Kişiselleştirilmiş Öneriler**: Öğrenci seviyesine göre
- **Dinamik Sınav Oluşturma**: AI ile anında sınav hazırlama

## 📱 Responsive Design

Proje tüm cihazlarda mükemmel çalışır:

- **Desktop**: 1200px+ (lg:)
- **Tablet**: 768px - 1199px (md:)
- **Mobile**: 320px - 767px (sm:)

### Özellikler
- **Mobile-First**: Önce mobil tasarım
- **Flexible Grid**: CSS Grid ve Flexbox
- **Touch-Friendly**: Mobil dokunmatik optimizasyonu
- **Fast Loading**: Optimize edilmiş performans

## 🚀 Deployment

### Vercel (Önerilen)
```bash
npm run build
vercel --prod
```

### Netlify
```bash
npm run build
# dist klasörünü Netlify'a yükleyin
```

### GitHub Pages
```bash
npm run build
# dist klasörünü GitHub Pages'e yükleyin
```

## 🧪 Test

```bash
# Unit testler
npm run test

# E2E testler
npm run test:e2e

# Coverage raporu
npm run test:coverage
```

## 🤝 Katkıda Bulunma

1. **Fork yapın** - Projeyi fork edin
2. **Branch oluşturun** - `git checkout -b feature/amazing-feature`
3. **Commit yapın** - `git commit -m 'Add amazing feature'`
4. **Push yapın** - `git push origin feature/amazing-feature`
5. **Pull Request oluşturun** - GitHub'da PR açın

### Katkı Kuralları
- **Kod Stili**: ESLint ve Prettier kullanın
- **Commit Mesajları**: Conventional Commits formatı
- **Test**: Yeni özellikler için test yazın
- **Dokümantasyon**: README'yi güncelleyin

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

## 📞 İletişim

- **Email**: info@cfkacademy.com
- **Website**: https://cfkacademy.com
- **GitHub**: https://github.com/your-username/cfk-academy
- **LinkedIn**: https://linkedin.com/company/cfk-academy

## 🙏 Teşekkürler

- [React](https://reactjs.org/) - UI framework
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Supabase](https://supabase.com/) - Backend ve authentication
- [Gemini AI](https://ai.google.dev/) - AI integration
- [Vite](https://vitejs.dev/) - Build tool
- [Lucide React](https://lucide.dev/) - Icons
- [Framer Motion](https://www.framer.com/motion/) - Animasyonlar
- [Zustand](https://zustand-demo.pmnd.rs/) - State management

## 🎯 Gelecek Geliştirmeler

### 🚀 **Yakın Vadeli (1-3 Ay)**

#### 📚 **İçerik Geliştirmeleri**
- [ ] **Video Dersler**: Konu bazlı video içerikler ve ders kayıtları
- [ ] **PDF Ders Notları**: İndirilebilir ders notları ve özetler
- [ ] **Sesli Açıklamalar**: AI destekli sesli soru açıklamaları
- [ ] **Çalışma Planları**: Kişiselleştirilmiş haftalık/aylık planlar

#### 🎮 **Gamification Sistemi**
- [ ] **Puan Sistemi**: Başarı puanları ve seviye atlama
- [ ] **Rozetler**: Başarı rozetleri ve sertifikalar
- [ ] **Liderlik Tablosu**: Öğrenci sıralaması
- [ ] **Günlük Görevler**: Motivasyon artırıcı görevler

#### 📊 **Gelişmiş Analitik**
- [ ] **Detaylı Raporlar**: PDF formatında detaylı analiz raporları
- [ ] **Karşılaştırma Grafikleri**: Diğer öğrencilerle karşılaştırma
- [ ] **Hedef Takibi**: SMART hedef belirleme ve takip
- [ ] **Performans Tahmini**: AI destekli sınav sonuç tahmini

### 🔮 **Orta Vadeli (3-6 Ay)**

#### 👥 **Sosyal Özellikler**
- [ ] **Öğrenci Forumu**: Soru-cevap platformu
- [ ] **Grup Çalışması**: Sanal çalışma grupları
- [ ] **Mentor Sistemi**: Üst sınıf öğrencilerden mentorluk
- [ ] **Sosyal Medya Entegrasyonu**: Başarı paylaşımı

#### 🎓 **Eğitmen Özellikleri**
- [ ] **Eğitmen Paneli**: Öğretmenler için özel dashboard
- [ ] **Sınıf Yönetimi**: Öğrenci takip ve yönetim
- [ ] **Ödev Sistemi**: Online ödev verme ve kontrol
- [ ] **Veli Bilgilendirme**: Veli-öğretmen iletişimi

#### 📱 **Mobil Uygulama**
- [ ] **React Native App**: iOS ve Android uygulaması
- [ ] **Offline Çalışma**: İnternet olmadan çalışma
- [ ] **Push Bildirimler**: Hatırlatmalar ve güncellemeler
- [ ] **Mobil Optimizasyon**: Touch-friendly arayüz

### 🌟 **Uzun Vadeli (6+ Ay)**

#### 🤖 **Gelişmiş AI Özellikleri**
- [ ] **Kişisel AI Asistan**: Her öğrenciye özel AI mentor
- [ ] **Sesli Sohbet**: Voice-to-text AI sohbeti
- [ ] **Görsel Soru Çözümü**: Fotoğraf ile soru çözme
- [ ] **Duygu Analizi**: Öğrenci motivasyon takibi

#### 🎯 **Kişiselleştirme**
- [ ] **Adaptif Öğrenme**: AI destekli öğrenme yolu
- [ ] **Öğrenme Stili Analizi**: VAK (Görsel-Auditory-Kinestetik) analizi
- [ ] **Hafıza Teknikleri**: Spaced repetition sistemi
- [ ] **Dikkat Takibi**: Eye-tracking ve focus analizi

#### 🌐 **Platform Genişletme**
- [ ] **Çoklu Dil Desteği**: İngilizce, Almanca, Fransızca
- [ ] **Uluslararası Sınavlar**: SAT, ACT, IB hazırlık
- [ ] **Meslek Edinme**: Teknik ve mesleki eğitim
- [ ] **Yetişkin Eğitimi**: Sürekli öğrenme platformu

#### 🔬 **AR/VR Teknolojileri**
- [ ] **Sanal Laboratuvar**: 3D fen deneyleri
- [ ] **Sanal Sınıf**: VR ile uzaktan eğitim
- [ ] **İnteraktif Haritalar**: Tarih ve coğrafya dersleri
- [ ] **3D Matematik**: Geometri ve matematik görselleştirme
