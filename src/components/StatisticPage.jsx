import React, { useEffect, useState } from "react";
import { supabase } from '../lib/supabaseClient';
import { useSession } from "@supabase/auth-helpers-react";
import { 
  BarChart3, 
  TrendingUp, 
  Target, 
  Award,
  BookOpen,
  Clock,
  CheckCircle,
  XCircle,
  MinusCircle,
  Brain
} from "lucide-react";
import { askGemini } from "../api/gemini";

const StatisticPage = () => {
    const session = useSession();

    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processedData, setProcessedData] = useState([]);

    // Önceki filtreler:
    const [examCategory, setExamCategory] = useState("deneme"); // "deneme" veya "sinav"
    const [examType, setExamType] = useState(""); // sınav türü (TYT, AYT, LGS vb)

    const [aiEvaluation, setAiEvaluation] = useState("");
    const [aiLoading, setAiLoading] = useState(false);

    useEffect(() => {
        const fetchResults = async () => {
            setLoading(true);
            let query = supabase.from(
                examCategory === "sinav" ? "exam_results" : "test_results"
            ).select("*").eq("user_id", session?.user?.id);

            if (examCategory === "deneme" && examType && examType !== "Tümü") {
                query = query.ilike("exam_type", examType.toLowerCase());
            }

            if (examCategory === "sinav" && examType && examType !== "Tümü") {
                query = query.ilike("exam_type", examType.toLowerCase());
            }

            const { data, error } = await query;

            if (error) {
                console.error("Veri alma hatası:", error.message);
            } else {
                // Transform data for exam_results to match expected format
                const transformedData = data.map(item => {
                    if (examCategory === "sinav") {
                        return {
                            ...item,
                            correct_count: item.correct_answers,
                            wrong_count: item.wrong_answers,
                            unanswered_count: item.total_questions - item.correct_answers - item.wrong_answers,
                            section_name: item.subject,
                            topic: item.level
                        };
                    } else {
                        // test_results için dönüşüm
                        return {
                            ...item,
                            correct_count: item.correct_answers,
                            wrong_count: item.wrong_answers,
                            unanswered_count: item.total_questions - item.correct_answers - item.wrong_answers,
                            section_name: item.subject,
                            topic: item.level
                        };
                    }
                });
                setResults(transformedData);
            }
            setLoading(false);
        };

        if (session?.user?.id) fetchResults();
    }, [session, examCategory, examType]);

    // Deneme sınavı için sınav türleri
    const denemeExamTypes = ["Tümü", "tyt", "ayt", "lgs"];
    const sinavExamTypes = ["Tümü", "tyt", "ayt", "lgs"];

    // Filtrelenmiş veriye göre gruplama fonksiyonu
    const groupResultsByTopic = (data) => {
        const topicMap = {};

        data.forEach((item) => {
            const key = `${item.exam_type}-${item.section_name || item.subject}-${item.topic || item.level || "Genel"}`;
            if (!topicMap[key]) {
                topicMap[key] = {
                    topic: `${(item.exam_type || "").toUpperCase()} - ${item.section_name || item.subject || ""} - ${item.topic || item.level || "Genel"}`,
                    correct: 0,
                    wrong: 0,
                    empty: 0,
                };
            }

            topicMap[key].correct += item.correct_count || item.correct_answers || item.correct || 0;
            topicMap[key].wrong += item.wrong_count || item.wrong_answers || item.wrong || 0;
            topicMap[key].empty += item.unanswered_count || item.empty || 0;
        });

        const result = Object.values(topicMap).map((item) => ({
            ...item,
            accuracy: ((item.correct / (item.correct + item.wrong || 1)) * 100).toFixed(1),
        }));

        return result.sort((a, b) => b.accuracy - a.accuracy);
    };

    useEffect(() => {
        if (results.length === 0) {
            setProcessedData([]);
            setAiEvaluation("");
            return;
        }

        const groupedData = groupResultsByTopic(results);
        setProcessedData(groupedData);
    }, [results, examCategory, examType]); // Add examCategory and examType as dependencies

    const generateAiEvaluation = async (data, examType) => {
        setAiLoading(true);
        try {
            const prompt = `
            Aşağıdaki sınav sonuçlarını analiz ederek öğrenciye öneriler ver:
            
            Sınav Türü: ${examType}
            Toplam Sınav Sayısı: ${data.length}
            
            Konu Bazlı Başarı Oranları:
            ${data.map(item => `${item.topic}: %${item.accuracy}`).join('\n')}
            
            Bu verilere göre:
            1. En iyi performans gösterdiği konular
            2. Geliştirilmesi gereken alanlar
            3. Öneriler ve çalışma planı
            4. Genel değerlendirme
            
            Türkçe olarak yanıtla.
            `;

            const response = await askGemini(prompt);
            setAiEvaluation(response);
        } catch (error) {
            console.error("AI değerlendirme hatası:", error);
            setAiEvaluation("AI değerlendirmesi şu anda kullanılamıyor.");
        } finally {
            setAiLoading(false);
        }
    };

    const handleExamTypeChange = (newExamType) => {
        setExamType(newExamType);
        setResults([]); // Mevcut sonuçları temizle
        setProcessedData([]); // İşlenmiş verileri temizle
        setAiEvaluation(""); // AI değerlendirmesini temizle
    };

    const handleExamCategoryChange = (newCategory) => {
        setExamCategory(newCategory);
        setExamType(""); // Sınav kategorisi değiştiğinde sınav türünü sıfırla
        setResults([]); // Mevcut sonuçları temizle
        setProcessedData([]); // İşlenmiş verileri temizle
        setAiEvaluation(""); // AI değerlendirmesini temizle
    };

    const getTotalStats = () => {
        if (!results.length) return { total: 0, correct: 0, wrong: 0, empty: 0, accuracy: 0 };
        
        const totals = results.reduce((acc, item) => ({
            correct: acc.correct + (item.correct_count || item.correct_answers || item.correct || 0),
            wrong: acc.wrong + (item.wrong_count || item.wrong_answers || item.wrong || 0),
            empty: acc.empty + (item.unanswered_count || item.empty || 0)
        }), { correct: 0, wrong: 0, empty: 0 });

        const total = totals.correct + totals.wrong + totals.empty;
        const accuracy = total > 0 ? ((totals.correct / total) * 100).toFixed(1) : 0;

        return { ...totals, total, accuracy };
    };

    const stats = getTotalStats();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-300">İstatistikler yükleniyor...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">
                        İstatistiklerim
                    </h1>
                    <p className="text-xl text-gray-300">
                        Performansınızı analiz edin ve gelişim alanlarınızı keşfedin
                    </p>
                </div>

                {/* Filters */}
                <div className="card-glass p-6 mb-8">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-white mb-2">
                                Sınav Kategorisi
                            </label>
                            <select
                                value={examCategory}
                                onChange={(e) => handleExamCategoryChange(e.target.value)}
                                className="w-full px-4 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300"
                            >
                                <option value="deneme" className="text-gray-800 bg-white">Deneme Sınavları</option>
                                <option value="sinav" className="text-gray-800 bg-white">Sınavlar</option>
                            </select>
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-white mb-2">
                                Sınav Türü
                            </label>
                            <select
                                value={examType}
                                onChange={(e) => handleExamTypeChange(e.target.value)}
                                className="w-full px-4 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300"
                            >
                                {examCategory === "deneme" 
                                    ? denemeExamTypes.map(type => (
                                        <option key={type} value={type} className="text-gray-800 bg-white">{type.toUpperCase()}</option>
                                    ))
                                    : sinavExamTypes.map(type => (
                                        <option key={type} value={type} className="text-gray-800 bg-white">{type.toUpperCase()}</option>
                                    ))
                                }
                            </select>
                        </div>
                    </div>
                </div>

                {/* Overall Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="card-glass p-6 text-center">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <BarChart3 className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">{stats.total}</h3>
                        <p className="text-gray-300">Toplam Soru</p>
                    </div>
                    
                    <div className="card-glass p-6 text-center">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">{stats.correct}</h3>
                        <p className="text-gray-300">Doğru</p>
                    </div>
                    
                    <div className="card-glass p-6 text-center">
                        <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <XCircle className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">{stats.wrong}</h3>
                        <p className="text-gray-300">Yanlış</p>
                    </div>
                    
                    <div className="card-glass p-6 text-center">
                        <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <MinusCircle className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">{stats.empty}</h3>
                        <p className="text-gray-300">Boş</p>
                    </div>
                </div>

                {/* Accuracy */}
                <div className="card-glass p-8 mb-8 text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <Target className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-4xl font-bold gradient-text mb-2">%{stats.accuracy}</h2>
                    <p className="text-xl text-gray-300">Genel Başarı Oranı</p>
                </div>

                {/* Topic Performance */}
                {processedData.length > 0 && (
                    <div className="card-glass p-8 mb-8">
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                            <BookOpen className="w-6 h-6 mr-3 text-purple-400" />
                            Konu Bazlı Performans
                        </h2>
                        <div className="space-y-4">
                            {processedData.slice(0, 10).map((item, index) => (
                                <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
                                    <div className="flex-1">
                                        <h3 className="text-white font-medium">{item.topic}</h3>
                                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-300">
                                            <span>Doğru: {item.correct}</span>
                                            <span>Yanlış: {item.wrong}</span>
                                            <span>Boş: {item.empty}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold gradient-text">%{item.accuracy}</div>
                                        <div className="text-sm text-gray-300">Başarı</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* AI Evaluation */}
                <div className="card-glass p-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-white flex items-center">
                            <Brain className="w-6 h-6 mr-3 text-purple-400" />
                            AI Değerlendirmesi
                        </h2>
                        <button
                            onClick={() => generateAiEvaluation(processedData, examType || "Tümü")}
                            disabled={aiLoading || processedData.length === 0}
                            className="btn-primary"
                        >
                            {aiLoading ? (
                                <div className="flex items-center">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                    Analiz ediliyor...
                                </div>
                            ) : (
                                <div className="flex items-center">
                                    <TrendingUp className="w-4 h-4 mr-2" />
                                    AI Analizi
                                </div>
                            )}
                        </button>
                    </div>
                    
                    {aiEvaluation && (
                        <div className="bg-white/5 rounded-2xl p-6">
                            <div className="prose prose-invert max-w-none">
                                <div className="whitespace-pre-wrap text-gray-300">{aiEvaluation}</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StatisticPage;
