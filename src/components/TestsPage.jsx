import React, { useState, useEffect, useRef } from "react";
import { askGemini } from "../api/gemini";
import { supabase } from '../lib/supabaseClient';
// import CountdownTimer from "./CountdownTimer";
import ScrollToTopButton from "./ScrollToTopButton";

const examDurations = {
  TYT: 165, // dakika
  AYT: 180,
  LGS: 155,
};

const YKS_SECTIONS = {
  TYT: [
    { name: "Türkçe", count: 40, duration: 165 },
    { name: "Temel Matematik", count: 40, duration: 165 },
    {
      name: "Sosyal Bilimler",
      duration: 80,
      subSections: [
        { name: "Coğrafya", count: 5 },
        { name: "Din Kültürü", count: 5 },
        { name: "Felsefe", count: 5 },
        { name: "Tarih", count: 5 },
      ],
    },
    {
      name: "Fen Bilimleri",
      duration: 80,
      subSections: [
        { name: "Fizik", count: 7 },
        { name: "Kimya", count: 7 },
        { name: "Biyoloji", count: 6 },
      ],
    },
  ],
  AYT: [
    { name: "Türk Dili ve Edebiyatı", count: 40, duration: 180 },
    { name: "Matematik", count: 40, duration: 180 },
    {
      name: "Sosyal Bilimler",
      duration: 100,
      subSections: [
        { name: "Tarih", count: 11 },
        { name: "Coğrafya", count: 11 },
        { name: "Felsefe", count: 12 },
        { name: "Din Kültürü", count: 6 },
      ],
    },
    {
      name: "Fizik Kimya Biyoloji",
      duration: 100,
      subSections: [
        { name: "Fizik", count: 14 },
        { name: "Kimya", count: 13 },
        { name: "Biyoloji", count: 13 },
      ],
    },
  ],
};

const LGS_SECTIONS = [
  { name: "Türkçe", count: 20, duration: 50 },
  { name: "Matematik", count: 20, duration: 40 },
  { name: "Fen Bilimleri", count: 20, duration: 30 },
  { name: "İnkılap Tarihi", count: 10, duration: 20 },
  { name: "İngilizce", count: 10, duration: 20 },
  { name: "Din Kültürü", count: 10, duration: 20 },
];

const TestsPage = () => {
  const [sectionQuestions, setSectionQuestions] = useState({});
  const [sectionAnswers, setSectionAnswers] = useState({});
  const [selectedExam, setSelectedExam] = useState(null);
  const [examId, setExamId] = useState(null);
  const [sections, setSections] = useState([]);
  const [flatSections, setFlatSections] = useState([]);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showSectionMessage, setShowSectionMessage] = useState(false);
  const [examSummary, setExamSummary] = useState([]);
  const [aytTrack, setAytTrack] = useState(null);
  const [apiError, setApiError] = useState(false);

  const [user, setUser] = useState(null);
  // Sağa sabit buton ve açılır panel
  const [showPanel, setShowPanel] = useState(false);
  const panelRef = useRef(null);

  const scrollToQuestion = (sectionName, index) => {
    const id = `${sectionName.replace(/\s/g, "_")}_q${index}`;
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setShowPanel(false);
      }
    }

    if (showPanel) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPanel]);

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Kullanıcı alınamadı:", error.message);
      } else {
        setUser(data.user);
      }
    };
    fetchUser();

    // Sayfa yüklendiğinde localStorage'dan durumu geri yükle
    const savedState = localStorage.getItem('testsPageState');
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        if (parsedState.selectedExam) {
          setSelectedExam(parsedState.selectedExam);
          setExamId(parsedState.examId);
          setSections(parsedState.sections || []);
          setFlatSections(parsedState.flatSections || []);
          setCurrentSectionIndex(parsedState.currentSectionIndex || 0);
          setSectionQuestions(parsedState.sectionQuestions || {});
          setSelectedAnswers(parsedState.selectedAnswers || {});
        }
      } catch (error) {
        console.error('Durum geri yüklenirken hata:', error);
      }
    }
  }, []);

  const saveResultsToSupabase = async (resultsData) => {
    if (!user) return;
    try {
      // Tüm bölümlerin sonuçlarını tek bir kayıtta topla
      const allAnswers = {};
      const allQuestions = [];
      let totalCorrect = 0;
      let totalWrong = 0;
      let totalEmpty = 0;
      let totalQuestions = 0;

      resultsData.forEach((result, index) => {
        const questionId = index + 1;
        allAnswers[questionId] = result.userAnswer || null;
        
        allQuestions.push({
          id: questionId,
          section: result.section,
          question: result.question || '',
          options: result.options || {},
          correct: result.correctAnswer || '',
          explanation: result.explanation || '',
          user_answer: result.userAnswer || null,
          is_correct: result.correct > 0,
          is_wrong: result.wrong > 0,
          is_empty: result.empty > 0
        });

        totalCorrect += result.correct;
        totalWrong += result.wrong;
        totalEmpty += result.empty;
        totalQuestions++;
      });

      const totalScore = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

      const testResult = {
        user_id: user.id,
        exam_type: selectedExam.toLowerCase(),
        subject: 'complete_exam', // Tüm sınav için tek kayıt
        level: 'orta', // Default level
        total_questions: totalQuestions,
        correct_answers: totalCorrect,
        wrong_answers: totalWrong,
        empty_answers: totalEmpty,
        score: totalScore,
        time_spent: 0, // Bölüm bazlı süre takibi yok
        answers: allAnswers,
        questions: allQuestions,
        exam_id: examId, // Sınav ID'si ekle
        completed_at: new Date().toISOString()
      };

      const { error } = await supabase.from('test_results').insert(testResult);
      if (error) {
        console.error('Supabase kayıt hatası:', error);
      } else {
        console.log('Test results saved successfully');
      }
    } catch (err) {
      console.error('Kayıt hatası:', err);
    }
  };

  const saveStateToLocalStorage = () => {
    const stateToSave = {
      selectedExam,
      examId,
      sections,
      flatSections,
      currentSectionIndex,
      sectionQuestions,
      selectedAnswers
    };
    localStorage.setItem('testsPageState', JSON.stringify(stateToSave));
  };

  const clearStateFromLocalStorage = () => {
    localStorage.removeItem('testsPageState');
  };

  const calculateResults = async (currentSection) => {
    let correct = 0;
    const topicResults = [];

    questions.forEach((q, i) => {
      const userAnswer = selectedAnswers[i];
      var isItWhat = "";
      if (userAnswer == null) isItWhat = "Empty";
      else if (userAnswer === q.correct) isItWhat = "Correct";
      else isItWhat = "Wrong";

      if (isItWhat === "Correct") correct++;
      topicResults.push({
        user_id: user.id,
        exam_type: selectedExam,
        section: currentSection.name,
        topic: q.topic || 'Genel',
        correct: isItWhat === "Correct" ? 1 : 0,
        wrong: isItWhat === "Wrong" ? 1 : 0,
        empty: isItWhat === "Empty" ? 1 : 0,
        question: q.question,
        options: q.options,
        correctAnswer: q.correct,
        explanation: q.explanation,
        userAnswer: userAnswer,
        date: new Date().toISOString(),
      });
    });

    // Sonuçları geçici olarak sakla
    setSectionAnswers(prev => ({
      ...prev,
      [currentSection.name]: topicResults
    }));

    return {
      score: Math.round((correct / questions.length) * 100),
      correct,
      total: questions.length,
      answers: selectedAnswers,
      topicResults: topicResults // topicResults'ı da döndür
    };
  };

  const handleExamSelect = async (examType) => {
    // Clear any existing timer from localStorage
    const existingKeys = Object.keys(localStorage);
    existingKeys.forEach(key => {
      if (key.startsWith('exam-timer-')) {
        localStorage.removeItem(key);
      }
    });

    // Clear previous state
    clearStateFromLocalStorage();

    const newExamId = `${examType}-${Date.now()}`;
    setSelectedExam(examType);
    setExamId(newExamId);
    setCurrentSectionIndex(0);
    setSectionQuestions({});
    setSectionAnswers({});
    setSelectedAnswers({});
    setShowSectionMessage(false);

    let examSections;
    if (examType === 'LGS') {
      examSections = LGS_SECTIONS;
      setFlatSections(LGS_SECTIONS);
    } else {
      examSections = YKS_SECTIONS[examType];
      const flat = [];
      examSections.forEach(section => {
        if (section.subSections) {
          section.subSections.forEach(subSection => {
            flat.push({
              ...subSection,
              parentSection: section.name,
              duration: section.duration
            });
          });
        } else {
          flat.push(section);
        }
      });
      setFlatSections(flat);
    }
    setSections(examSections);
  };

  async function fetchQuestions(section, examType) {
    const prompt = `
${examType} sınavı için "${section.name}" bölümünde ${section.count} soruluk ZOR bir deneme sınavı hazırla. 

ÖNEMLİ: Sorular orta-üst seviye ve zorlukta olmalı. Kolay sorular kullanma. Sorular gerçek sınav zorluğunda ve hatta daha zor olmalı. Öğrencileri zorlayacak, analiz gerektiren, detaylı düşünme becerisi isteyen sorular hazırla.

Yanıtı yalnızca JSON formatında ve tek satır olarak, stringlerde satır sonları için \\n kullanarak ver. Her sorunun "id" alanı benzersiz olmalı. Örnek format:

{
  "questions": [
    {
      "id": 1,
      "question": "Soru metni",
      "options": {
        "A": "Seçenek A",
        "B": "Seçenek B",
        "C": "Seçenek C",
        "D": "Seçenek D",
        "E": "Seçenek E"
      },
      "correct": "A",
      "explanation": "Cevabın açıklaması"
    }
  ]
}
`;

    try {
      const response = await askGemini(prompt);
      
      // JSON parse işlemini daha güvenli hale getir
      let data;
      try {
        data = JSON.parse(response);
      } catch (parseError) {
        console.error('JSON parse hatası:', parseError);
        // Eğer JSON parse başarısız olursa, basit sorular oluştur
        return generateFallbackQuestions(section, examType);
      }
      
      if (data && data.questions && data.questions.length > 0) {
        return data.questions;
      } else {
        console.warn('API boş sonuç döndürdü, fallback sorular kullanılıyor');
        return generateFallbackQuestions(section, examType);
      }
    } catch (error) {
      console.error('Sorular alınırken hata:', error.message);
      
      // Rate limit hatası için özel mesaj
      if (error.message.includes('rate limit')) {
        console.warn('API rate limit aşıldı, fallback sorular kullanılıyor');
        setApiError(true);
      }
      
      return generateFallbackQuestions(section, examType);
    }
  }

  function generateFallbackQuestions(section, examType) {
    const questions = [];
    const questionCount = section.count || 10;
    
    // Her bölüm için özel soru şablonları
    const questionTemplates = {
      "Türkçe": [
        "Aşağıdaki cümlelerden hangisinde yazım hatası vardır?",
        "Hangi cümlede anlatım bozukluğu bulunmaktadır?",
        "Aşağıdaki kelimelerden hangisi yapısı bakımından diğerlerinden farklıdır?",
        "Hangi cümlede noktalama işareti yanlış kullanılmıştır?",
        "Aşağıdaki parçada hangi anlatım tekniği kullanılmıştır?"
      ],
      "Matematik": [
        "x² + 5x + 6 = 0 denkleminin kökleri toplamı kaçtır?",
        "Bir üçgenin iç açıları 2x, 3x ve 4x ise x kaçtır?",
        "Logaritma işlemi log₂(8) kaçtır?",
        "Bir aritmetik dizinin ilk terimi 3, ortak farkı 2 ise 10. terimi kaçtır?",
        "Bir fonksiyonun türevi f'(x) = 2x + 3 ise f(x) fonksiyonu nedir?"
      ],
      "Fizik": [
        "Bir cismin kinetik enerjisi 100 J, potansiyel enerjisi 50 J ise toplam mekanik enerji kaç J'dir?",
        "Ses dalgalarının frekansı 440 Hz ise dalga boyu kaç metredir?",
        "Bir elektrik devresinde akım 2A, direnç 5Ω ise gerilim kaç V'dir?",
        "Bir cismin kütlesi 2 kg, ivmesi 3 m/s² ise net kuvvet kaç N'dir?",
        "Bir atomun çekirdeğinde kaç proton varsa o kadar elektron bulunur."
      ],
      "Kimya": [
        "H₂O molekülünde hidrojen atomlarının oksidasyon sayısı kaçtır?",
        "Bir çözeltinin pH'ı 3 ise H⁺ iyonu derişimi kaç mol/L'dir?",
        "CH₄ molekülünde karbon atomunun hibritleşme türü nedir?",
        "Bir tepkimenin aktivasyon enerjisi yüksekse tepkime hızı nasıldır?",
        "Periyodik tabloda aynı grupta bulunan elementlerin özellikleri benzerdir."
      ],
      "Biyoloji": [
        "Hücre zarının temel yapısını oluşturan molekül hangisidir?",
        "Bir DNA molekülünde adenin nükleotidi %30 ise timin oranı kaçtır?",
        "Mitokondri organelinin temel görevi nedir?",
        "Bir hücrenin interfaz evresinde hangi organel çoğalır?",
        "Bitkilerde fotosentez hangi organelde gerçekleşir?"
      ],
      "Tarih": [
        "Osmanlı Devleti'nin kurucusu kimdir?",
        "İstanbul'un fethi hangi yılda gerçekleşmiştir?",
        "Türkiye Cumhuriyeti hangi tarihte ilan edilmiştir?",
        "I. Dünya Savaşı hangi yıllar arasında gerçekleşmiştir?",
        "Atatürk'ün doğum yeri neresidir?"
      ],
      "Coğrafya": [
        "Türkiye'nin en yüksek dağı hangisidir?",
        "Karadeniz Bölgesi'nin en önemli tarım ürünü nedir?",
        "Türkiye'nin en büyük gölü hangisidir?",
        "Akdeniz ikliminin özellikleri nelerdir?",
        "Türkiye'nin en kalabalık şehri hangisidir?"
      ],
      "Felsefe": [
        "Felsefenin temel sorularından biri hangisidir?",
        "Sokrates'in öğretim yöntemi nedir?",
        "Platon'un idealar kuramı neyi savunur?",
        "Aristoteles'in mantık bilimine katkısı nedir?",
        "Descartes'in 'Düşünüyorum, o halde varım' sözü neyi ifade eder?"
      ],
      "Din Kültürü": [
        "İslam'ın temel inanç esasları kaç tanedir?",
        "Kur'an-ı Kerim'in ilk inen ayeti hangisidir?",
        "İslam'da namazın farzları kaç tanedir?",
        "Hac ibadeti hangi ayda gerçekleştirilir?",
        "İslam'da zekatın farz olması için gerekli şartlar nelerdir?"
      ],
      "İngilizce": [
        "Which tense is used for actions happening now?",
        "What is the past participle of 'go'?",
        "Which modal verb expresses possibility?",
        "What is the comparative form of 'good'?",
        "Which article is used before consonant sounds?"
      ]
    };
    
    const templates = questionTemplates[section.name] || questionTemplates["Matematik"];
    
    for (let i = 1; i <= questionCount; i++) {
      const templateIndex = (i - 1) % templates.length;
      questions.push({
        id: i,
        question: templates[templateIndex],
        options: {
          "A": "Seçenek A",
          "B": "Seçenek B", 
          "C": "Seçenek C",
          "D": "Seçenek D",
          "E": "Seçenek E"
        },
        correct: "A",
        explanation: "Bu soru API hatası nedeniyle oluşturulmuştur. Gerçek sınav soruları için lütfen daha sonra tekrar deneyin."
      });
    }
    
    return questions;
  }

  function handleAnswerSelect(questionIndex, option) {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionIndex]: option
    }));
  }

  async function goToNextSection() {
    if (currentSectionIndex < flatSections.length - 1) {
      const currentSection = flatSections[currentSectionIndex];
      const results = await calculateResults(currentSection);
      
      setShowSectionMessage(true);
      setTimeout(() => {
        setCurrentSectionIndex(currentSectionIndex + 1);
        setSelectedAnswers({});
        setShowSectionMessage(false);
      }, 2000);
    } else {
      // Sınav tamamlandı
      const currentSection = flatSections[currentSectionIndex];
      const results = await calculateResults(currentSection);
      
      // Tüm bölümlerin sonuçlarını topla ve kaydet
      const allResults = Object.values(sectionAnswers).flat();
      // Son bölümün sonuçlarını da ekle
      const currentSectionResults = await calculateResults(currentSection);
      allResults.push(...currentSectionResults.topicResults);
      await saveResultsToSupabase(allResults);

      setCurrentSectionIndex(currentSectionIndex + 1);
    }
  }

  function stripHtmlTags(text) {
    return text.replace(/<[^>]*>/g, '');
  }

  useEffect(() => {
    if (selectedExam && flatSections.length > 0 && currentSectionIndex < flatSections.length) {
      const currentSection = flatSections[currentSectionIndex];
      
      if (!sectionQuestions[currentSection.name]) {
        setLoading(true);
        setApiError(false);
        fetchQuestions(currentSection, selectedExam).then(questions => {
          setSectionQuestions(prev => ({
            ...prev,
            [currentSection.name]: questions
          }));
          setQuestions(questions);
          setLoading(false);
        }).catch(error => {
          console.error('Error fetching questions:', error);
          setLoading(false);
        });
      } else {
        setQuestions(sectionQuestions[currentSection.name]);
      }
    }
  }, [selectedExam, currentSectionIndex, flatSections]);

  // State değişikliklerini localStorage'a kaydet
  useEffect(() => {
    if (selectedExam) {
      saveStateToLocalStorage();
    }
  }, [selectedExam, examId, sections, flatSections, currentSectionIndex, sectionQuestions, selectedAnswers]);

  // Sınav tamamlandığında localStorage'ı temizle
  useEffect(() => {
    if (currentSectionIndex >= flatSections.length && flatSections.length > 0) {
      clearStateFromLocalStorage();
    }
  }, [currentSectionIndex, flatSections.length]);

  if (!selectedExam) {
    return (
      <div className="min-h-screen py-8 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="card-glass border-0 shadow-2xl rounded-3xl overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-8">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center animate-float">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold mb-2">Deneme Sınavları</h1>
                    <p className="text-purple-100 text-lg">Gerçek sınav deneyimi yaşayın</p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <button
                    onClick={() => handleExamSelect('TYT')}
                    className="card-glass border-0 p-6 text-left hover:bg-white/20 transition-all duration-300 group"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1">TYT</h3>
                        <p className="text-gray-300">Temel Yeterlilik Testi</p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleExamSelect('AYT')}
                    className="card-glass border-0 p-6 text-left hover:bg-white/20 transition-all duration-300 group"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1">AYT</h3>
                        <p className="text-gray-300">Alan Yeterlilik Testi</p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleExamSelect('LGS')}
                    className="card-glass border-0 p-6 text-left hover:bg-white/20 transition-all duration-300 group"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1">LGS</h3>
                        <p className="text-gray-300">Liselere Geçiş Sınavı</p>
                      </div>
                    </div>
                  </button>

                  <button
                    className="card-glass border-0 p-6 text-left hover:bg-white/20 transition-all duration-300 group opacity-50 cursor-not-allowed"
                    disabled
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-gray-500 to-gray-600 rounded-2xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1">Yakında</h3>
                        <p className="text-gray-300">Daha fazla sınav türü</p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center py-8 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-6 animate-float">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Sorular Hazırlanıyor...</h2>
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  if (currentSectionIndex >= flatSections.length) {
    return (
      <div className="min-h-screen flex items-center justify-center py-8 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="max-w-2xl mx-auto px-4">
          <div className="card-glass border-0 shadow-2xl rounded-3xl p-8 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6 animate-pulse">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Sınav Tamamlandı!</h2>
            <p className="text-gray-300 mb-6">Tebrikler! Tüm bölümleri başarıyla tamamladınız.</p>
            <button
              onClick={() => {
                setSelectedExam(null);
                setExamSummary([]);
                setCurrentSectionIndex(0);
                setSectionQuestions({});
                setSectionAnswers({});
                setSelectedAnswers({});
              }}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-2xl font-bold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105"
            >
              Yeni Sınav Başlat
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentSection = flatSections[currentSectionIndex];

  return (
    <div className="min-h-screen py-8 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                {selectedExam} Sınavı
              </h1>
              <p className="text-gray-300">
                Bölüm {currentSectionIndex + 1} / {flatSections.length}: {currentSection.name}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowPanel(!showPanel)}
                className="bg-white/10 backdrop-blur-sm text-white p-3 rounded-2xl hover:bg-white/20 transition-all duration-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="card-glass border-0 shadow-2xl rounded-3xl p-8">
              {/* Section Message */}
              {showSectionMessage && (
                <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-2xl text-green-300">
                  <div className="flex items-center space-x-3">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-semibold">Bölüm tamamlandı! Sonraki bölüme geçiliyor...</span>
                  </div>
                </div>
              )}

              {/* API Error Message */}
              {apiError && (
                <div className="mb-6 p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-2xl text-yellow-300">
                  <div className="flex items-center space-x-3">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <span className="font-semibold">API hatası nedeniyle örnek sorular gösteriliyor. Gerçek sorular için daha sonra tekrar deneyin.</span>
                  </div>
                </div>
              )}

              {/* Questions */}
              <div className="space-y-8">
                {questions.map((question, index) => (
                  <div key={question.id} id={`${currentSection.name.replace(/\s/g, "_")}_q${index}`} className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                    <div className="flex items-start space-x-4 mb-4">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-white text-lg leading-relaxed">{question.question}</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {Object.entries(question.options).map(([key, value]) => (
                        <label
                          key={key}
                          className={`block p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                            selectedAnswers[index] === key
                              ? 'border-purple-500 bg-purple-500/20'
                              : 'border-white/20 hover:border-white/40 bg-white/5'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`question-${index}`}
                            value={key}
                            checked={selectedAnswers[index] === key}
                            onChange={() => handleAnswerSelect(index, key)}
                            className="sr-only"
                          />
                          <div className="flex items-center space-x-3">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              selectedAnswers[index] === key
                                ? 'border-purple-500 bg-purple-500'
                                : 'border-white/40'
                            }`}>
                              {selectedAnswers[index] === key && (
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              )}
                            </div>
                            <span className="text-white font-medium">{key}) {value}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Navigation */}
              <div className="mt-8 flex justify-between items-center">
                <button
                  onClick={() => setCurrentSectionIndex(Math.max(0, currentSectionIndex - 1))}
                  disabled={currentSectionIndex === 0}
                  className={`px-6 py-3 rounded-2xl font-bold transition-all duration-300 ${
                    currentSectionIndex === 0
                      ? 'bg-gray-500/20 text-gray-400 cursor-not-allowed'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  Önceki Bölüm
                </button>

                <button
                  onClick={goToNextSection}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-2xl font-bold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105"
                >
                  {currentSectionIndex === flatSections.length - 1 ? 'Sınavı Bitir' : 'Sonraki Bölüm'}
                </button>
              </div>
            </div>
          </div>

          {/* Side Panel */}
          <div className="lg:col-span-1">
            <div className="card-glass border-0 shadow-2xl rounded-3xl p-6 sticky top-8">
              <h3 className="text-xl font-bold text-white mb-4">Sınav Navigasyonu</h3>
              
              <div className="space-y-3">
                {flatSections.map((section, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSectionIndex(index)}
                    className={`w-full text-left p-3 rounded-xl transition-all duration-300 ${
                      index === currentSectionIndex
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{section.name}</span>
                      <span className="text-sm opacity-75">{section.count} soru</span>
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-white/20">
                <h4 className="text-white font-semibold mb-3">İlerleme</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">Cevaplanan</span>
                    <span className="text-white font-medium">
                      {Object.keys(selectedAnswers).length} / {questions.length}
                    </span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${questions.length > 0 ? (Object.keys(selectedAnswers).length / questions.length) * 100 : 0}%`
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ScrollToTopButton />
    </div>
  );
};

export default TestsPage;