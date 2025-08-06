import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const ImageSlider = () => {
  const slides = [
    {
      title: "YKS Hazırlık",
      subtitle: "Üniversite sınavına hazırlık",
      description: "TYT ve AYT konularında uzman eğitmenlerle çalışın",
      icon: (
        <svg className="w-12 h-12 text-violet-500" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
        </svg>
      ),
      gradient: "from-violet-500 to-purple-600"
    },
    {
      title: "LGS Hazırlık", 
      subtitle: "Liseye geçiş sınavına hazırlık",
      description: "8. sınıf müfredatına uygun özel dersler",
      icon: (
        <svg className="w-12 h-12 text-cyan-500" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      gradient: "from-cyan-500 to-blue-600"
    },
    {
      title: "AI Destekli Öğrenme",
      subtitle: "Yapay zeka ile kişiselleştirilmiş eğitim",
      description: "Gemini AI ile sorularınızı anında yanıtlayın",
      icon: (
        <svg className="w-12 h-12 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
        </svg>
      ),
      gradient: "from-emerald-500 to-green-600"
    },
    {
      title: "Online Deneme Sınavları",
      subtitle: "Konu bazlı ve genel deneme sınavları",
      description: "Gerçek sınav deneyimi yaşayın",
      icon: (
        <svg className="w-12 h-12 text-pink-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
        </svg>
      ),
      gradient: "from-pink-500 to-rose-600"
    }
  ];

  return (
    <div className="w-full">
      <Swiper
        modules={[Autoplay, Pagination, Navigation]}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        loop={true}
        slidesPerView={1}
        pagination={{ 
          clickable: true,
          bulletClass: 'swiper-pagination-bullet bg-white/50',
          bulletActiveClass: 'swiper-pagination-bullet-active bg-white'
        }}
        navigation={{
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
        }}
        className="hero-slider rounded-3xl overflow-hidden"
        style={{ height: '400px' }}
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={index}>
            <div className="flex items-center justify-center h-full p-8">
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/20 w-full h-full flex flex-col justify-center items-center text-center">
                <div className={`w-24 h-24 bg-gradient-to-r ${slide.gradient} rounded-2xl flex items-center justify-center mb-6 shadow-lg animate-pulse`}>
                  {slide.icon}
                </div>
                <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">{slide.title}</h2>
                <h5 className="text-xl text-white/80 mb-4">{slide.subtitle}</h5>
                <p className="text-lg text-white/70 leading-relaxed max-w-md">{slide.description}</p>
              </div>
            </div>
          </SwiperSlide>
        ))}
        
        {/* Custom Navigation Buttons */}
        <div className="swiper-button-prev !text-white !bg-white/10 !backdrop-blur-sm !w-12 !h-12 !rounded-full !border !border-white/20 hover:!bg-white/20 transition-all duration-300"></div>
        <div className="swiper-button-next !text-white !bg-white/10 !backdrop-blur-sm !w-12 !h-12 !rounded-full !border !border-white/20 hover:!bg-white/20 transition-all duration-300"></div>
      </Swiper>
    </div>
  );
};

export default ImageSlider;
