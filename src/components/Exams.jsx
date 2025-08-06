import { useState, useEffect, useRef } from 'react';
import { askGemini } from '../api/gemini';
import { supabase } from '../lib/supabaseClient';
import SoruNavigasyonu from './SoruNavigasyonu';

const Exams = ({ user }) => {
  const [selectedExam, setSelectedExam] = useState(() => {
    if (!user?.id) return 'tyt';
    const savedExam = localStorage.getItem(`examExam_${user.id}`);
    return savedExam || 'tyt';
  });
  const [selectedSubject, setSelectedSubject] = useState(() => {
    if (!user?.id) return 'turkce';
    const savedSubject = localStorage.getItem(`examSubject_${user.id}`);
    return savedSubject || 'turkce';
  });
  const [selectedLevel, setSelectedLevel] = useState(() => {
    if (!user?.id) return 'orta';
    const savedLevel = localStorage.getItem(`examLevel_${user.id}`);
    return savedLevel || 'orta';
  });
  const [questionCount, setQuestionCount] = useState(() => {
    if (!user?.id) return 10;
    const savedCount = localStorage.getItem(`examQuestionCount_${user.id}`);
    return savedCount ? parseInt(savedCount) : 10;
  });
  const [loading, setLoading] = useState(false);
  const [exam, setExam] = useState(() => {
    if (!user?.id) return null;
    const savedExam = localStorage.getItem(`examData_${user.id}`);
    return savedExam ? JSON.parse(savedExam) : null;
  });
  const [currentQuestion, setCurrentQuestion] = useState(() => {
    if (!user?.id) return 0;
    const savedQuestion = localStorage.getItem(`examCurrentQuestion_${user.id}`);
    return savedQuestion ? parseInt(savedQuestion) : 0;
  });
  const [answers, setAnswers] = useState(() => {
    if (!user?.id) return {};
    const savedAnswers = localStorage.getItem(`examAnswers_${user.id}`);
    return savedAnswers ? JSON.parse(savedAnswers) : {};
  });
  const [showResults, setShowResults] = useState(() => {
    if (!user?.id) return false;
    const savedShowResults = localStorage.getItem(`examShowResults_${user.id}`);
    return savedShowResults === 'true';
  });
  const [results, setResults] = useState(() => {
    if (!user?.id) return null;
    const savedResults = localStorage.getItem(`examResults_${user.id}`);
    return savedResults ? JSON.parse(savedResults) : null;
  });

  const [secondsPassed, setSecondsPassed] = useState(() => {
    if (!user?.id) return 0;
    const savedSeconds = localStorage.getItem(`examSeconds_${user.id}`);
    return savedSeconds ? parseInt(savedSeconds) : 0;
  });
  const timerRef = useRef(null);
  const isMountedRef = useRef(true);

  const examTypes = {
    tyt: 'TYT',
    ayt: 'AYT',
    lgs: 'LGS'
  };

  const subjectsMap = {
    tyt: {
      turkce: 'Türkçe',
      matematik: 'Temel Matematik',
      sosyal: 'Sosyal Bilimler',
      fen: 'Fen Bilimleri'
    },
    ayt: {
      turkce: 'Türk Dili ve Edebiyatı',
      matematik: 'Matematik',
      sosyal: 'Sosyal Bilimler',
      fen: 'Fen Bilimleri'
    },
    lgs: {
      turkce: 'Türkçe',
      matematik: 'Matematik',
      fen: 'Fen Bilimleri',
      inkilap: 'T.C. İnkılap Tarihi ve Atatürkçülük',
      din: 'Din Kültürü ve Ahlak Bilgisi',
      ingilizce: 'İngilizce'
    }
  };

  const levels = {
    kolay: 'Kolay',
    orta: 'Orta',
    zor: 'Zor'
  };

  // Geçerli selectedExam ve selectedSubject değerlerini al
  const validSelectedExam = subjectsMap[selectedExam] ? selectedExam : 'tyt';
  const validSelectedSubject = subjectsMap[validSelectedExam]?.[selectedSubject] ? selectedSubject : 'turkce';

  // State değişikliklerini localStorage'a kaydet
  useEffect(() => {
    if (user?.id) {
      localStorage.setItem(`examExam_${user.id}`, selectedExam);
    }
  }, [selectedExam, user?.id]);

  useEffect(() => {
    if (user?.id) {
      localStorage.setItem(`examSubject_${user.id}`, selectedSubject);
    }
  }, [selectedSubject, user?.id]);

  useEffect(() => {
    if (user?.id) {
      localStorage.setItem(`examLevel_${user.id}`, selectedLevel);
    }
  }, [selectedLevel, user?.id]);

  useEffect(() => {
    if (user?.id) {
      localStorage.setItem(`examQuestionCount_${user.id}`, questionCount.toString());
    }
  }, [questionCount, user?.id]);

  useEffect(() => {
    if (user?.id && exam) {
      localStorage.setItem(`examData_${user.id}`, JSON.stringify(exam));
    }
  }, [exam, user?.id]);

  useEffect(() => {
    if (user?.id) {
      localStorage.setItem(`examCurrentQuestion_${user.id}`, currentQuestion.toString());
    }
  }, [currentQuestion, user?.id]);

  useEffect(() => {
    if (user?.id) {
      localStorage.setItem(`examAnswers_${user.id}`, JSON.stringify(answers));
    }
  }, [answers, user?.id]);

  useEffect(() => {
    if (user?.id) {
      localStorage.setItem(`examShowResults_${user.id}`, showResults.toString());
    }
  }, [showResults, user?.id]);

  useEffect(() => {
    if (user?.id && results) {
      localStorage.setItem(`examResults_${user.id}`, JSON.stringify(results));
    }
  }, [results, user?.id]);

  // Kullanıcı değiştiğinde localStorage'ı temizle
  useEffect(() => {
    if (!user?.id) {
      setExam(null);
      setCurrentQuestion(0);
      setAnswers({});
      setShowResults(false);
      setResults(null);
      setSecondsPassed(0);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      localStorage.setItem(`examSeconds_${user.id}`, secondsPassed.toString());
    }
  }, [secondsPassed, user?.id]);

  // Component mount/unmount durumunu takip et
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (exam && !showResults) {
      timerRef.current = setInterval(() => {
        if (isMountedRef.current) {
          setSecondsPassed((prev) => prev + 1);
        }
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [exam, showResults]);

  const generateExam = async () => {
    // Loading state'ini set et ama diğer state'leri sıfırlama
    setLoading(true);
    
    // Mevcut exam varsa sadece loading göster, sıfırlama
    if (!exam) {
      setCurrentQuestion(0);
      setAnswers({});
      setShowResults(false);
      setResults(null);
      setSecondsPassed(0);
    }

    const examType = examTypes[validSelectedExam] || 'TYT';
    const subjectName = subjectsMap[validSelectedExam]?.[validSelectedSubject] || 'Türkçe';
    const levelName = levels[selectedLevel] || 'Orta';

    const prompt = `
${examType} sınavı için "${subjectName}" dersinde, "${levelName}" seviyesinde, ${questionCount} soruluk bir deneme sınavı hazırla.

Yanıtı yalnızca JSON formatında ve tek satır olarak, stringlerde satır sonları için \\n kullanarak ver. Her sorunun "id" alanı benzersiz olmalı. Örnek format:

{
  "title": "Sınav başlığı",
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
      
      // Component hala mount mu kontrol et
      if (isMountedRef.current) {
        const examData = JSON.parse(response);
        
        if (examData && examData.questions) {
          setExam(examData);
        }
      }
    } catch (error) {
      console.error('Sınav oluşturulurken hata:', error);
      // Component hala mount mu kontrol et
      if (isMountedRef.current) {
        console.log('Sınav oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.');
      }
    } finally {
      // Component hala mount mu kontrol et
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  const saveResultsToSupabase = async (resultsData) => {
    try {
      // Prepare the complete test data
      const testResultData = {
        user_id: user.id,
        exam_type: validSelectedExam,
        subject: validSelectedSubject,
        level: selectedLevel,
        total_questions: exam.questions.length,
        correct_answers: resultsData.correct,
        wrong_answers: resultsData.wrong,
        score: resultsData.score,
        time_spent: resultsData.time,
        answers: resultsData.answers, // User's answers
        questions: exam.questions.map(q => ({
          id: q.id,
          question: q.question,
          options: q.options,
          correct: q.correct,
          explanation: q.explanation,
          user_answer: resultsData.answers[q.id] || null
        }))
      };

      const { error } = await supabase
        .from('test_results')
        .insert([testResultData]);

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Test results saved successfully');
    } catch (error) {
      console.error('Sonuçlar kaydedilirken hata:', error);
      // Don't throw error to prevent blocking the UI
    }
  };

  const calculateResults = async () => {
    const correctAnswers = exam.questions.filter(
      (question) => answers[question.id] === question.correct
    ).length;

    const wrongAnswers = exam.questions.length - correctAnswers;
    const score = Math.round((correctAnswers / exam.questions.length) * 100);
    
    const resultsData = {
      score: score,
      correct: correctAnswers,
      wrong: wrongAnswers,
      total: exam.questions.length,
      time: secondsPassed,
      answers: answers
    };

    await saveResultsToSupabase(resultsData);

    setResults({
      score: score,
      correct: correctAnswers,
      wrong: wrongAnswers,
      total: exam.questions.length,
      time: secondsPassed,
      answers: answers
    });

    setShowResults(true);
  };

  const resetExam = () => {
    setExam(null);
    setCurrentQuestion(0);
    setAnswers({});
    setShowResults(false);
    setResults(null);
    setSecondsPassed(0);
    
    // localStorage'dan da temizle
    if (user?.id) {
      localStorage.removeItem(`examData_${user.id}`);
      localStorage.removeItem(`examCurrentQuestion_${user.id}`);
      localStorage.removeItem(`examAnswers_${user.id}`);
      localStorage.removeItem(`examShowResults_${user.id}`);
      localStorage.removeItem(`examResults_${user.id}`);
      localStorage.removeItem(`examSeconds_${user.id}`);
    }
  };

  const handleAnswer = (questionId, selectedOption) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: selectedOption
    }));
  };

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const subjects = subjectsMap[validSelectedExam] || subjectsMap.tyt;

  return (
    <div className="min-h-screen py-8 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {!exam && (
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
                    <h1 className="text-3xl font-bold mb-2">Özel Sınav Oluştur</h1>
                    <p className="text-purple-100 text-lg">AI destekli kişiselleştirilmiş sınavlar</p>
                  </div>
                </div>
              </div>

              {/* Form */}
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-white mb-3 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                      </svg>
                      Sınav Türü
                    </label>
                    <select
                      className="input-primary w-full py-3 text-white"
                      value={validSelectedExam}
                      onChange={(e) => setSelectedExam(e.target.value)}
                    >
                      {Object.entries(examTypes).map(([key, value]) => (
                        <option key={key} value={key} className="text-gray-800">
                          {value}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-white mb-3 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      Ders
                    </label>
                    <select
                      className="input-primary w-full py-3 text-white"
                      value={validSelectedSubject}
                      onChange={(e) => setSelectedSubject(e.target.value)}
                    >
                      {Object.entries(subjects || {}).map(([key, value]) => (
                        <option key={key} value={key} className="text-gray-800">
                          {value}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-white mb-3 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      Seviye
                    </label>
                    <select
                      className="input-primary w-full py-3 text-white"
                      value={selectedLevel}
                      onChange={(e) => setSelectedLevel(e.target.value)}
                    >
                      {Object.entries(levels).map(([key, value]) => (
                        <option key={key} value={key} className="text-gray-800">
                          {value}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-white mb-3 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                      </svg>
                      Soru Sayısı
                    </label>
                    <input
                      className="input-primary w-full py-3 text-white"
                      type="number"
                      value={questionCount}
                      onChange={(e) => setQuestionCount(Number(e.target.value))}
                      min={1}
                      max={50}
                    />
                  </div>
                </div>

                <div className="text-center mt-8">
                  <button
                    onClick={generateExam}
                    className="btn-primary px-8 py-4 text-lg font-bold flex items-center justify-center space-x-3 mx-auto"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                        <span>Sınav Oluşturuluyor...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span>Sınav Oluştur</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {exam && !showResults && (
          <div className="max-w-7xl mx-auto">
            <div className="card-glass border-0 shadow-2xl rounded-3xl overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h1 className="text-2xl font-bold mb-2">{exam.title}</h1>
                    <p className="text-purple-100">
                      Soru {currentQuestion + 1} / {exam.questions.length}
                    </p>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-3">
                    <div className="flex items-center space-x-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-bold text-lg">{formatTime(secondsPassed)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                  {/* Sol taraf - Soru içeriği */}
                  <div className="lg:col-span-3">
                    <div className="mb-8">
                      <h2 className="text-xl font-bold text-white mb-6">
                        {currentQuestion + 1}. {exam.questions[currentQuestion].question}
                      </h2>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(exam.questions[currentQuestion].options).map(
                          ([key, value]) => (
                            <button
                              key={key}
                              className={`w-full text-left p-6 rounded-2xl border-2 transition-all duration-300 ${
                                answers[exam.questions[currentQuestion].id] === key
                                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-purple-500 shadow-lg'
                                  : 'bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 hover:border-white/40'
                              }`}
                              onClick={() =>
                                handleAnswer(exam.questions[currentQuestion].id, key)
                              }
                            >
                              <div className="flex items-start space-x-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                  answers[exam.questions[currentQuestion].id] === key
                                    ? 'bg-white/20'
                                    : 'bg-white/10'
                                }`}>
                                  <span className="font-bold">{key}</span>
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm leading-relaxed">{value}</p>
                                </div>
                              </div>
                            </button>
                          )
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <button
                        className="btn-secondary px-6 py-3 flex items-center space-x-2"
                        onClick={() =>
                          setCurrentQuestion((prev) => Math.max(0, prev - 1))
                        }
                        disabled={currentQuestion === 0}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        <span>Önceki</span>
                      </button>

                      {currentQuestion === exam.questions.length - 1 ? (
                        <button 
                          className="btn-primary px-8 py-3 flex items-center space-x-2 font-bold"
                          onClick={calculateResults}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>Sınavı Bitir</span>
                        </button>
                      ) : (
                        <button
                          className="btn-primary px-8 py-3 flex items-center space-x-2 font-bold"
                          onClick={() => setCurrentQuestion((prev) => prev + 1)}
                        >
                          <span>Sonraki</span>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Sağ taraf - Soru navigasyonu */}
                  <div className="lg:col-span-1">
                    <div className="sticky top-6">
                      <SoruNavigasyonu
                        currentQuestion={currentQuestion}
                        setCurrentQuestion={setCurrentQuestion}
                        totalQuestions={exam.questions.length}
                        answers={answers}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {showResults && results && (
          <div className="max-w-6xl mx-auto">
            <div className="card-glass border-0 shadow-2xl rounded-3xl overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-8">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center animate-float">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold mb-2">Sınav Sonuçları</h1>
                    <p className="text-green-100 text-lg">Performansınızı görüntüleyin</p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-8">
                {/* Score Summary */}
                <div className="text-center mb-8">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-full w-32 h-32 flex items-center justify-center mx-auto mb-6 shadow-2xl">
                    <h1 className="text-white font-bold text-4xl">{results.score}%</h1>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {results.correct} doğru / {results.wrong} yanlış / {results.total} soru
                  </h2>
                  <p className="text-gray-300 mb-4">Süre: {formatTime(results.time)}</p>
                  <div className="w-full bg-white/10 rounded-full h-3 mb-6">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${results.score}%` }}
                    ></div>
                  </div>
                </div>

                {/* Questions Review */}
                <div className="space-y-6">
                  {exam.questions.map((question, index) => (
                    <div key={question.id} className="card-glass border-0 rounded-2xl overflow-hidden">
                      <div className={`p-6 ${
                        results.answers[question.id] === question.correct
                          ? 'border-l-4 border-green-500'
                          : 'border-l-4 border-red-500'
                      }`}>
                        <div className="flex items-center space-x-3 mb-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            results.answers[question.id] === question.correct
                              ? 'bg-green-500 text-white'
                              : 'bg-red-500 text-white'
                          }`}>
                            {results.answers[question.id] === question.correct ? (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            )}
                          </div>
                          <h3 className="text-lg font-bold text-white">Soru {index + 1}</h3>
                        </div>
                        
                        <p className="text-gray-200 mb-4 text-lg">{question.question}</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                          {Object.entries(question.options).map(([key, value]) => (
                            <div
                              key={key}
                              className={`p-4 rounded-xl border-2 ${
                                results.answers[question.id] === key
                                  ? key === question.correct
                                    ? 'bg-green-500/20 border-green-500 text-green-200'
                                    : 'bg-red-500/20 border-red-500 text-red-200'
                                  : key === question.correct
                                    ? 'bg-green-500/20 border-green-500 text-green-200'
                                    : 'bg-white/5 border-white/20 text-gray-300'
                              }`}
                            >
                              <div className="flex items-start space-x-3">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                                  results.answers[question.id] === key
                                    ? key === question.correct
                                      ? 'bg-green-500 text-white'
                                      : 'bg-red-500 text-white'
                                    : key === question.correct
                                      ? 'bg-green-500 text-white'
                                      : 'bg-white/20 text-white'
                                }`}>
                                  <span className="text-xs font-bold">{key}</span>
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm">{value}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="bg-white/5 rounded-xl p-4">
                          <div className="flex items-start space-x-3">
                            <svg className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div>
                              <p className="text-blue-300 font-semibold mb-1">Açıklama</p>
                              <p className="text-gray-300 text-sm">{question.explanation}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-center mt-8">
                  <button 
                    className="btn-primary px-8 py-4 text-lg font-bold flex items-center space-x-3 mx-auto"
                    onClick={resetExam}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    <span>Yeni Sınav Oluştur</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Exams;
