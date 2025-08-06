import { useState, useRef, useEffect } from 'react';
import { askGemini } from '../api/gemini';
import { supabase } from '../lib/supabaseClient';
import { useGlobalStore } from '../store/globalStore';
import { 
  MessageCircle, 
  Send, 
  Trash2, 
  Bot, 
  User, 
  BookOpen, 
  GraduationCap,
  Loader2,
  Maximize2,
  Minimize2
} from "lucide-react";

const Chat = ({ user }) => {
  // Global store'dan sadece exam/subject seçimlerini al
  const {
    selectedExam: globalSelectedExam,
    selectedSubject: globalSelectedSubject,
    setSelectedExam,
    setSelectedSubject,
  } = useGlobalStore();

  // Local state'ler
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(() => {
    if (!user?.id) return false;
    const savedFullscreen = localStorage.getItem(`chatFullscreen_${user.id}`);
    return savedFullscreen === 'true';
  });
  const [isInitialized, setIsInitialized] = useState(false);
  const messagesContainerRef = useRef(null);

  // LGS ve YKS için dersler ayrı ayrı tanımlandı
  const subjectsMap = {
    tyt: {
      turkce: 'Türkçe',
      matematik: 'Temel Matematik',
      sosyal: 'Sosyal Bilimler',
      fen: 'Fen Bilimleri',
    },
    ayt: {
      turkce: 'Türk Dili ve Edebiyatı',
      matematik: 'Matematik',
      sosyal: 'Sosyal Bilimler',
      fen: 'Fen Bilimleri',
    },
    lgs: {
      matematik: 'Matematik',
      fen: 'Fen Bilimleri',
      turkce: 'Türkçe',
      sosyal: 'Sosyal Bilgiler',
      inkilap: 'T.C. İnkılap Tarihi ve Atatürkçülük',
      din: 'Din Kültürü ve Ahlak Bilgisi',
      ingilizce: 'İngilizce',
    },
  };

  const examTypes = {
    tyt: 'TYT',
    ayt: 'AYT',
    lgs: 'LGS',
  };

  // Geçerli selectedExam ve selectedSubject değerlerini al
  const selectedExam = subjectsMap[globalSelectedExam] ? globalSelectedExam : 'tyt';
  const selectedSubject = subjectsMap[selectedExam]?.[globalSelectedSubject] ? globalSelectedSubject : 'turkce';

  // Supabase'den konuşmaları yükle
  const loadConversations = async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('chat_conversations')
        .select('*')
        .eq('user_id', user.id)
        .eq('exam_type', selectedExam)
        .eq('subject', selectedSubject)
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error('Error loading conversations:', error);
        return;
      }
      
      // Konuşmaları mesaj formatına çevir
      const loadedMessages = [];
      data?.forEach(conversation => {
        // Kullanıcı sorusu
        loadedMessages.push({
          id: conversation.id * 2,
          text: conversation.question,
          sender: 'user',
          timestamp: new Date(conversation.created_at).toLocaleTimeString('tr-TR'),
        });
        
        // AI cevabı
        if (conversation.response) {
          loadedMessages.push({
            id: conversation.id * 2 + 1,
            text: conversation.response,
            sender: 'ai',
            timestamp: new Date(conversation.created_at).toLocaleTimeString('tr-TR'),
            isError: conversation.is_error
          });
        }
      });
      
      // State'i güncelle
      setMessages(loadedMessages);
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  // Konuşmayı Supabase'e kaydet
  const saveConversation = async (question, response, isError = false) => {
    if (!user?.id) return;
    
    try {
      const { error } = await supabase
        .from('chat_conversations')
        .insert({
          user_id: user.id,
          exam_type: selectedExam,
          subject: selectedSubject,
          question: question,
          response: response,
          is_error: isError
        });
      
      if (error) {
        console.error('Error saving conversation:', error);
      }
    } catch (error) {
      console.error('Error saving conversation:', error);
    }
  };

  // selectedExam değişince, selectedSubject uygun şekilde resetlenir
  useEffect(() => {
    const subjectsForExam = subjectsMap[selectedExam];
    // Eğer selectedExam geçerli değilse veya mevcut selectedSubject bu sınavda yoksa ilk dersi seç
    if (!subjectsForExam) {
      setSelectedSubject('turkce'); // Default değer
    } else if (!subjectsForExam[selectedSubject]) {
      const firstSubjectKey = Object.keys(subjectsForExam)[0];
      setSelectedSubject(firstSubjectKey);
    }
  }, [selectedExam, selectedSubject, setSelectedSubject]);

  // Global store'dan gelen değerler geçersizse düzelt
  useEffect(() => {
    if (globalSelectedExam !== selectedExam) {
      setSelectedExam(selectedExam);
    }
    if (globalSelectedSubject !== selectedSubject) {
      setSelectedSubject(selectedSubject);
    }
  }, [globalSelectedExam, globalSelectedSubject, selectedExam, selectedSubject, setSelectedExam, setSelectedSubject]);

  // Kullanıcı değiştiğinde fullscreen durumunu güncelle
  useEffect(() => {
    if (user?.id) {
      const savedFullscreen = localStorage.getItem(`chatFullscreen_${user.id}`);
      if (savedFullscreen) {
        const isFullscreen = savedFullscreen === 'true';
        setIsFullscreen(isFullscreen);
        if (isFullscreen) {
          document.body.style.overflow = 'hidden';
        }
      }
    } else {
      setIsFullscreen(false);
    }
  }, [user?.id]);

  // Component unmount olduğunda body overflow'unu geri yükle
  useEffect(() => {
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  // İlk yükleme ve exam/subject değiştiğinde konuşmaları yükle
  useEffect(() => {
    if (user?.id && selectedExam && selectedSubject) {
      // Mesajları temizle ve yeniden yükle
      setMessages([]);
      loadConversations();
    }
  }, [user?.id, selectedExam, selectedSubject]);

  // Mesajlar değiştiğinde scroll'u en alta kaydır
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = {
      id: Date.now(),
      text: input,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString('tr-TR'),
    };

    // Kullanıcı mesajını hemen ekle
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const examType = examTypes[selectedExam] || 'TYT';
      const subjectName = subjectsMap[selectedExam]?.[selectedSubject] || 'Türkçe';
      
      const prompt = `Sen CFK Academy'nin ${examType} ${subjectName} öğretmenisin. 
Öğrencinin sorusunu detaylı ve anlaşılır bir şekilde cevapla. 
Gerekirse adım adım çözüm göster. 
Öğrenci sorusu: ${input}`;

      const response = await askGemini(prompt);

      const aiMessage = {
        id: Date.now() + 1,
        text: response,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString('tr-TR'),
      };

      // AI mesajını hemen ekle
      setMessages((prev) => [...prev, aiMessage]);
      
      // Veritabanına kaydet
      await saveConversation(input, response, false);
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        text: 'Üzgünüm, şu anda yanıt veremiyorum. Lütfen daha sonra tekrar deneyin.',
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString('tr-TR'),
        isError: true,
      };
      
      // Hata mesajını hemen ekle
      setMessages((prev) => [...prev, errorMessage]);
      
      // Veritabanına kaydet
      await saveConversation(input, 'Üzgünüm, şu anda yanıt veremiyorum. Lütfen daha sonra tekrar deneyin.', true);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = async () => {
    if (!user?.id) return;
    
    try {
      const { error } = await supabase
        .from('chat_conversations')
        .delete()
        .eq('user_id', user.id)
        .eq('exam_type', selectedExam)
        .eq('subject', selectedSubject);
      
      if (error) {
        console.error('Error clearing chat:', error);
        return;
      }
      
      setMessages([]);
    } catch (error) {
      console.error('Error clearing chat:', error);
    }
  };

  const toggleFullscreen = () => {
    const newFullscreen = !isFullscreen;
    setIsFullscreen(newFullscreen);
    
    // Body overflow'u kontrol et
    if (newFullscreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    if (user?.id) {
      localStorage.setItem(`chatFullscreen_${user.id}`, newFullscreen.toString());
    }
  };

  const subjects = subjectsMap[selectedExam] || subjectsMap.tyt;

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-[9999] bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' : 'min-h-screen py-2'}`}>
      <div className={`${isFullscreen ? 'h-full p-4' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-screen pb-4'}`}>
        {/* Header */}
        <div className="text-center mb-1 relative">
          <h1 className="text-xl md:text-2xl font-bold mb-1 gradient-text">
            AI Asistan
          </h1>
          <p className="text-sm text-gray-300">
            CFK Academy Yapay Zeka Destekli Öğrenme
          </p>
          
          {/* Full Screen Button */}
          <button
            onClick={toggleFullscreen}
            className="absolute top-0 right-0 p-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl hover:bg-white/20 transition-all duration-300"
            title={isFullscreen ? "Küçült" : "Tam Ekran"}
          >
            {isFullscreen ? (
              <Minimize2 className="w-5 h-5 text-white" />
            ) : (
              <Maximize2 className="w-5 h-5 text-white" />
            )}
          </button>
        </div>

        {/* Chat Container */}
        <div className={`card-glass ${isFullscreen ? 'h-[calc(100vh-120px)]' : 'h-[calc(100vh-200px)]'} flex flex-col`}>
          {/* Chat Header */}
          <div className="p-2 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">AI Asistan</h2>
                  <p className="text-gray-300 text-sm">Size yardımcı olmaya hazır</p>
                </div>
              </div>
              <button 
                onClick={clearChat}
                className="btn-secondary flex items-center space-x-2 px-4 py-2"
                title="Sohbeti Temizle"
              >
                <Trash2 className="w-4 h-4" />
                <span>Temizle</span>
              </button>
            </div>
          </div>

          {/* Subject and Exam Selection */}
          <div className="p-2 border-b border-white/10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-white mb-1 flex items-center">
                  <BookOpen className="w-4 h-4 mr-2 text-purple-400" />
                  Ders Seçin
                </label>
                <select
                  className="input-primary py-2 text-white"
                  value={selectedSubject}
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
                <label className="block text-sm font-medium text-white mb-1 flex items-center">
                  <GraduationCap className="w-4 h-4 mr-2 text-purple-400" />
                  Sınav Türü
                </label>
                <select
                  className="input-primary py-2 text-white"
                  value={selectedExam}
                  onChange={(e) => setSelectedExam(e.target.value)}
                >
                  {Object.entries(examTypes).map(([key, value]) => (
                    <option key={key} value={key} className="text-gray-800">
                      {value}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div 
            ref={messagesContainerRef}
            className="flex-1 p-3 overflow-y-auto min-h-0"
          >
            {messages.length === 0 ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-3 animate-float">
                  <MessageCircle className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Hoş Geldiniz!</h3>
                <p className="text-gray-300 text-sm">
                  {subjects[selectedSubject] || 'Türkçe'} dersi hakkında sorularınızı sorabilirsiniz.
                  <br />
                  AI asistanınız size yardımcı olmaya hazır.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sender === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[85%] p-3 rounded-xl ${
                        message.sender === 'user'
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                          : message.isError
                          ? 'bg-red-500/20 border border-red-500/30 text-red-200'
                          : 'bg-white/10 backdrop-blur-sm border border-white/20 text-white'
                      }`}
                    >
                      <div className="flex items-start space-x-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                          message.sender === 'user' 
                            ? 'bg-white/20' 
                            : 'bg-gradient-to-br from-purple-400 to-pink-500'
                        }`}>
                          {message.sender === 'user' ? (
                            <User className="w-3 h-3 text-white" />
                          ) : (
                            <Bot className="w-3 h-3 text-white" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="message-text mb-1 leading-relaxed text-sm whitespace-pre-wrap">
                            {message.text.split('\n').map((line, index) => {
                              // Görsel referanslarını temizle
                              if (line.includes('[Buraya şekil eklenecek:') || line.includes('[Buraya görsel eklenecek:')) {
                                return null; // Bu satırları gösterme
                              }
                              
                              // Tüm ** işaretlerini temizle
                              let cleanLine = line.replace(/\*\*/g, '');
                              
                              // Başlık formatı kontrolü
                              if (cleanLine.trim() && (cleanLine.endsWith(':') || /^(Soru|Çözüm|Cevap|Ek Açıklamalar):/.test(cleanLine))) {
                                return (
                                  <div key={index} className="font-bold text-white mb-2">
                                    {cleanLine}
                                  </div>
                                );
                              }
                              
                              // Alt başlık formatı (1. text)
                              if (/^\d+\.\s+/.test(cleanLine)) {
                                return (
                                  <div key={index} className="font-semibold text-purple-300 mb-1 mt-2">
                                    {cleanLine}
                                  </div>
                                );
                              }
                              
                              // Matematik formülü ($text$ veya $$text$$)
                              if (line.includes('$$')) {
                                // $$ işaretlerini kaldır
                                const formula = line.replace(/\$\$/g, '');
                                return (
                                  <div key={index} className="bg-white/5 p-2 rounded-lg my-1 font-mono text-cyan-300">
                                    {formula}
                                  </div>
                                );
                              } else if (line.includes('$') && line.trim().startsWith('$') && line.trim().endsWith('$')) {
                                // Tek $ işaretleri ile çevrili formüller
                                const formula = line.replace(/^\$\s*/, '').replace(/\s*\$$/, '');
                                return (
                                  <div key={index} className="bg-white/5 p-2 rounded-lg my-1 font-mono text-cyan-300">
                                    {formula}
                                  </div>
                                );
                              }
                              
                              // Liste öğesi (* text)
                              if (line.trim().startsWith('*')) {
                                return (
                                  <div key={index} className="ml-4 text-gray-300">
                                    • {line.replace(/^\*\s*/, '')}
                                  </div>
                                );
                              }
                              
                              // Boş satır
                              if (cleanLine.trim() === '') {
                                return <div key={index} className="h-2"></div>;
                              }
                              
                              // Normal metin içindeki $ işaretlerini temizle
                              const finalText = cleanLine.replace(/\$/g, '');
                              
                              // Normal metin
                              return (
                                <div key={index} className="text-gray-200">
                                  {finalText}
                                </div>
                              );
                            })}
                          </div>
                          <div className={`text-xs opacity-70 ${
                            message.sender === 'user' ? 'text-white' : 'text-gray-300'
                          }`}>
                            {message.timestamp}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex justify-start">
                    <div className="max-w-[85%] p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
                          <Bot className="w-3 h-3 text-white" />
                        </div>
                        <div className="flex items-center space-x-2">
                          <Loader2 className="w-3 h-3 text-purple-400 animate-spin" />
                          <span className="text-white text-sm">AI düşünüyor...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Input Form */}
          <div className="p-2 border-t border-white/10">
            <form onSubmit={handleSendMessage} className="flex space-x-3">
              <input
                type="text"
                className="input-primary flex-1 py-3"
                placeholder={`${subjects[selectedSubject] || 'Türkçe'} hakkında sorunuzu yazın...`}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
              />
              <button
                type="submit"
                className="btn-primary flex items-center space-x-2 px-6 py-3"
                disabled={!input.trim() || loading}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>Gönder</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
