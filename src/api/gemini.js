// src/api/gemini.js
export async function askGemini(prompt) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    console.error('GEMINI_API_KEY bulunamadı!');
    throw new Error('API anahtarı bulunamadı');
  }

  const url =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + apiKey;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error("API rate limit aşıldı. Lütfen biraz bekleyin.");
      } else if (response.status === 403) {
        throw new Error("API anahtarı geçersiz veya yetkisiz erişim.");
      } else {
        throw new Error(`API hatası: ${response.status} ${response.statusText}`);
      }
    }

    const data = await response.json();

    if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      let text = data.candidates[0].content.parts[0].text;

      // ✨ Markdown işaretlerini temizle
      text = text.replace(/```json\n?|```/g, "").trim();

      return text;
    } else {
      throw new Error("Yanıt alınamadı.");
    }
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error("İnternet bağlantısı hatası. Lütfen bağlantınızı kontrol edin.");
    }
    throw error;
  }
}
