import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Brain, 
  BookOpen, 
  Target, 
  Zap, 
  MessageSquare, 
  FileText, 
  BarChart3,
  ArrowRight,
  Star,
  Users,
  Award,
  TrendingUp,
  CheckCircle,
  Play,
  ChevronRight
} from 'lucide-react';

const HomePage = ({ user, isAuthenticated }) => {
  const features = [
    {
      icon: Brain,
      title: 'AI Destekli Öğrenme',
      description: 'Gemini AI ile kişiselleştirilmiş öğrenme deneyimi',
      color: 'from-purple-400 to-pink-500'
    },
    {
      icon: BookOpen,
      title: 'Kapsamlı İçerik',
      description: 'YKS ve LGS müfredatına uygun konular',
      color: 'from-pink-400 to-red-500'
    },
    {
      icon: Target,
      title: 'Hedef Odaklı',
      description: 'Kişisel hedeflerinize göre planlama',
      color: 'from-red-400 to-orange-500'
    },
    {
      icon: Zap,
      title: 'Hızlı Sonuç',
      description: 'Anında geri bildirim ve analiz',
      color: 'from-orange-400 to-yellow-500'
    }
  ];

  const stats = [
    { icon: Users, value: '10,000+', label: 'Aktif Öğrenci' },
    { icon: Award, value: '95%', label: 'Başarı Oranı' },
    { icon: TrendingUp, value: '50+', label: 'Konu Başlığı' },
    { icon: Star, value: '4.9/5', label: 'Kullanıcı Puanı' }
  ];

  const examTypes = [
    {
      title: 'TYT Hazırlık',
      subtitle: 'Temel Yeterlilik Testi',
      description: 'TYT sınavına kapsamlı hazırlık programı. Yapay zeka destekli kişiselleştirilmiş öğrenme deneyimi ile hedeflerinize ulaşın.',
      icon: FileText,
      color: 'from-purple-500 to-pink-500',
      features: [
        'Türkçe & Temel Matematik',
        'Sosyal Bilimler',
        'Fen Bilimleri',
        'Yapay Zeka Destekli Analiz'
      ],
      stats: {
        subjects: '4+ Konu',
        questions: '30,000+ Soru',
        success: '95% Başarı'
      }
    },
    {
      title: 'AYT Hazırlık',
      subtitle: 'Alan Yeterlilik Testi',
      description: 'AYT sınavına özel hazırlanmış içerikler. Alan seçimine göre kişiselleştirilmiş öğrenme deneyimi ile başarıya ulaşın.',
      icon: BookOpen,
      color: 'from-pink-500 to-red-500',
      features: [
        'Türk Dili ve Edebiyatı',
        'Matematik & Geometri',
        'Sosyal Bilimler',
        'Fen Bilimleri'
      ],
      stats: {
        subjects: '4+ Konu',
        questions: '25,000+ Soru',
        success: '93% Başarı'
      }
    },
    {
      title: 'LGS Hazırlık',
      subtitle: 'Liseye Geçiş Sınavı',
      description: 'Liseye geçiş sınavına özel hazırlanmış içerikler. Adım adım konu anlatımları ve deneme sınavları ile başarıya ulaşın.',
      icon: BookOpen,
      color: 'from-red-500 to-orange-500',
      features: [
        'Matematik & Geometri',
        'Fen Bilimleri',
        'Türkçe & Sosyal Bilgiler',
        'Kişisel Gelişim Takibi'
      ],
      stats: {
        subjects: '6+ Konu',
        questions: '30,000+ Soru',
        success: '92% Başarı'
      }
    }
  ];

  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden py-8 md:py-20">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-pattern opacity-30"></div>
        <div className="absolute inset-0">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative z-10 text-center max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-fade-in-up">
            <h1 className="heading-responsive font-bold mb-6 gradient-text">
              Geleceğin Eğitimi
              <br />
              <span className="text-white">Bugün Başlıyor</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Yapay zeka destekli öğrenme platformu ile TYT, AYT ve LGS sınavlarına 
              hazırlanın. Kişiselleştirilmiş deneyim, anında geri bildirim ve 
              kapsamlı içeriklerle başarıya ulaşın.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              {isAuthenticated ? (
                <Link to="/chat" className="btn-primary text-lg px-8 py-4 flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2" />
                  AI Chat ile Başla
                </Link>
              ) : (
                <>
                  <Link to="/register" className="btn-primary text-lg px-8 py-4 flex items-center">
                    <Play className="w-5 h-5 mr-2" />
                    Ücretsiz Başla
                  </Link>
                  <Link to="/login" className="btn-secondary text-lg px-8 py-4">
                    Giriş Yap
                  </Link>
                </>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="card-glass p-6 text-center animate-fade-in-up" style={{animationDelay: `${index * 0.1}s`}}>
                    <Icon className="w-8 h-8 mx-auto mb-2 text-purple-400" />
                    <div className="text-2xl font-bold gradient-text">{stat.value}</div>
                    <div className="text-sm text-gray-400">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 gradient-text">
              Neden CFK Academy?
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Modern teknoloji ve eğitim bilimini birleştirerek 
              öğrencilere en iyi deneyimi sunuyoruz.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="card-glass p-8 text-center hover-lift animate-fade-in-up" style={{animationDelay: `${index * 0.2}s`}}>
                  <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-white">{feature.title}</h3>
                  <p className="text-gray-300">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Exam Types Section */}
      <section className="py-20 relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 gradient-text">
              Sınav Hazırlık Programları
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              TYT, AYT ve LGS sınavlarına özel hazırlanmış kapsamlı içerikler
            </p>
          </div>

          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
            {examTypes.map((exam, index) => {
              const Icon = exam.icon;
              return (
                <div key={index} className="card-glass p-8 hover-lift animate-fade-in-up flex flex-col h-full" style={{animationDelay: `${index * 0.3}s`}}>
                  {/* Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div className={`w-20 h-20 bg-gradient-to-br ${exam.color} rounded-3xl flex items-center justify-center shadow-lg`}>
                      <Icon className="w-10 h-10 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-purple-400 font-medium">{exam.subtitle}</div>
                    </div>
                  </div>
                  
                  {/* Title & Description */}
                  <h3 className="text-2xl font-bold mb-2 text-white">{exam.title}</h3>
                  <p className="text-gray-300 mb-6 leading-relaxed">{exam.description}</p>
                  
                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 md:gap-4 mb-6 p-2 md:p-4 bg-white/5 rounded-2xl">
                    <div className="text-center">
                      <div className="text-sm md:text-lg font-bold gradient-text">{exam.stats.subjects}</div>
                      <div className="text-xs text-gray-400">Konu</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm md:text-lg font-bold gradient-text">{exam.stats.questions}</div>
                      <div className="text-xs text-gray-400">Soru</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm md:text-lg font-bold gradient-text">{exam.stats.success}</div>
                      <div className="text-xs text-gray-400">Başarı</div>
                    </div>
                  </div>
                  
                  {/* Features */}
                  <div className="space-y-3 mb-6 flex-1">
                    {exam.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex-shrink-0"></div>
                        <span className="text-sm text-gray-300">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  {/* CTA Button */}
                  <Link 
                    to={isAuthenticated ? "/exams" : "/register"} 
                    className="btn-primary inline-flex items-center w-full justify-center mt-auto"
                  >
                    {isAuthenticated ? "Devam Et" : "Ücretsiz Başla"}
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="card-glass p-12 animate-fade-in-up">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 gradient-text">
              Başarıya Giden Yolda
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Yapay zeka destekli öğrenme platformu ile hedeflerinize ulaşın. 
              Hemen başlayın ve farkı görün.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {isAuthenticated ? (
                <Link to="/chat" className="btn-primary text-lg px-8 py-4 flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2" />
                  AI Chat ile Devam Et
                </Link>
              ) : (
                <>
                  <Link to="/register" className="btn-primary text-lg px-8 py-4 flex items-center">
                    <Play className="w-5 h-5 mr-2" />
                    Ücretsiz Kayıt Ol
                  </Link>
                  <Link to="/login" className="btn-secondary text-lg px-8 py-4">
                    Giriş Yap
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage; 