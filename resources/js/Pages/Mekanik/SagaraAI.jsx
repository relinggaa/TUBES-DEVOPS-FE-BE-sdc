import React, { useState, useEffect, useRef } from "react";
import { Link, usePage, router } from "@inertiajs/react";
import { toast } from "react-toastify";
import { GoogleGenerativeAI } from "@google/generative-ai";

export default function SagaraAI({ keruskaanAcc = [] }) {
  const { auth, flash } = usePage().props;
  const user = auth?.user;

  useEffect(() => {
    if (flash?.success) {
      toast.success(flash.success, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        style: {
          backgroundColor: '#1e293b',
          color: '#ffffff',
          border: '1px solid #3b82f640',
          borderRadius: '12px',
          boxShadow: '0 4px 12px #3b82f630'
        },
        progressStyle: {
          background: 'linear-gradient(to right, #3b82f6, #06b6d4)'
        }
      });
    }

    if (flash?.error) {
      toast.error(flash.error, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        style: {
          backgroundColor: '#1e293b',
          color: '#ffffff',
          border: '1px solid #ef444440',
          borderRadius: '12px',
          boxShadow: '0 4px 12px #ef444430'
        },
        progressStyle: {
          background: 'linear-gradient(to right, #ef4444, #dc2626)'
        }
      });
    }
  }, [flash?.success, flash?.error]);

  const [selectedKendaraan, setSelectedKendaraan] = useState(null);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Halo! Saya adalah Sagara AI, asisten AI untuk membantu mekanik dalam perbaikan kendaraan. Pilih kendaraan yang ingin dianalisis untuk mendapatkan diagnosis lengkap."
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingAnalysis, setIsGeneratingAnalysis] = useState(false);
  const messagesEndRef = useRef(null);

  const genAI = useRef(null);
  const model = useRef(null);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (apiKey) {
      genAI.current = new GoogleGenerativeAI(apiKey);
      model.current = genAI.current.getGenerativeModel({ model: "gemini-2.5-flash" });
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleLogout = () => {
    if (confirm('Apakah Anda yakin ingin logout?')) {
      router.post('/mekanik/logout');
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading || !model.current) {
      if (!model.current) {
        toast.error('API Key Gemini error', {
          position: "top-right",
          autoClose: 5000,
        });
      }
      return;
    }

    const userMessage = inputMessage.trim();
    setInputMessage("");

    const userMessageObj = { role: "user", content: userMessage };
    setMessages(prev => [...prev, userMessageObj]);
    setIsLoading(true);

    try {
      const chatHistory = messages
        .slice(1)
        .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
        .join('\n');


      const activeRepairs = keruskaanAcc.map(acc => {
        const kendaraan = acc.kendaraan;
        const kerusakan = acc.kerusakan;
        return `Kendaraan: ${kendaraan?.merek || 'N/A'}, Plat: ${kendaraan?.plat_nomor || 'N/A'}, Status: ${kendaraan?.status || 'N/A'}, Kendala: ${kerusakan?.catatan || 'Tidak ada catatan'}`;
      }).join('\n');

      const context = keruskaanAcc.length > 0
        ? `Mekanik sedang menangani ${keruskaanAcc.length} kendaraan:\n${activeRepairs}`
        : 'Mekanik belum memiliki tugas perbaikan aktif';

      let prompt = `Anda adalah AI yang bernama Sagara AI berfungsi sebagai asisten AI khusus untuk mekanik yang membantu dalam perbaikan kendaraan.
      Konteks tugas mekanik: ${context}
      
      Sebagai asisten mekanik, Anda dapat membantu dengan:
      - Diagnosis dan analisis kerusakan kendaraan
      - Panduan langkah-langkah perbaikan
      - Estimasi biaya perbaikan dan spare part
      - Rekomendasi spare part yang diperlukan
      - Dokumentasi perbaikan
      - Tips troubleshooting
      - Informasi teknis tentang sistem kendaraan`;

      if (chatHistory.trim()) {
        prompt += `\n\nHistory percakapan sebelumnya:\n${chatHistory}`;
        prompt += `\n\nINSTRUKSI PENTING: Ini BUKAN percakapan pertama. JANGAN mengawali jawaban dengan "Halo", "Halo, saya Sagara AI", atau sapaan apapun. Langsung jawab pertanyaan mekanik dengan jelas dan membantu tanpa menyapa.`;
      } else {
        prompt += `\n\nINSTRUKSI PENTING: Ini adalah pertanyaan pertama mekanik setelah sapaan awal. JANGAN mengawali jawaban dengan "Halo", "Halo, saya Sagara AI", atau sapaan apapun karena Anda sudah menyapa di awal. Langsung jawab pertanyaan mekanik dengan jelas dan membantu.`;
      }

      prompt += `\n\nPertanyaan mekanik: ${userMessage}
      
      Berikan jawaban yang membantu, detail, dan relevan dengan konteks perbaikan kendaraan. Fokus pada aspek teknis dan praktis yang berguna untuk mekanik,jika pertanyaan mekanik tidak terkait dengan perbaikan kendaraan, silakan berikan pesan bahwa saya hanya menerima topik obrolan terkait masalah perbaikan kendaraan.`;

      const result = await model.current.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      setMessages(prev => [...prev, {
        role: "assistant",
        content: text
      }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Maaf, terjadi kesalahan."
      }]);
      toast.error('Gagal mengirim pesan ke AI', {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };


  const handleResetSelection = () => {
    setSelectedKendaraan(null);
    setMessages([
      {
        role: "assistant",
        content: "Pilih kendaraan yang ingin dianalisis untuk mendapatkan diagnosis lengkap."
      }
    ]);
  };

  const handleSelectKendaraan = async (keruskaanAccItem) => {
    if (!model.current || isGeneratingAnalysis) {
      if (!model.current) {
        toast.error('API Key Gemini error', {
          position: "top-right",
          autoClose: 5000,
        });
      }
      return;
    }

    setSelectedKendaraan(keruskaanAccItem);
    setIsGeneratingAnalysis(true);

    const kendaraan = keruskaanAccItem.kendaraan;
    const kerusakan = keruskaanAccItem.kerusakan;
    const driver = kendaraan?.driver;

    // Tambahkan pesan user
    setMessages(prev => [...prev, {
      role: "user",
      content: `Analisis kendaraan: ${kendaraan?.merek || 'N/A'} - ${kendaraan?.plat_nomor || 'N/A'}`
    }]);

    try {

      const kendalaList = kerusakan?.kendala 
        ? kerusakan.kendala.map((k, idx) => `${idx + 1}. ${k.name}: ${k.description}`).join('\n')
        : 'Tidak ada detail kendala';

      const context = `Kendaraan yang akan dianalisis:
          - Merek/Model: ${kendaraan?.merek || 'N/A'}
          - Plat Nomor: ${kendaraan?.plat_nomor || 'N/A'}
          - Status: ${kendaraan?.status || 'N/A'}
          - Driver: ${driver?.username || 'N/A'}
          - Catatan: ${kerusakan?.catatan || 'Tidak ada catatan'}
          - Daftar Kendala:
          ${kendalaList}`;

      const prompt = `Anda adalah AI yang bernama Sagara AI berfungsi sebagai asisten AI khusus untuk mekanik yang membantu dalam perbaikan kendaraan.

                      Konteks kendaraan yang akan dianalisis:
                      ${context}

                      Berdasarkan informasi kendaraan dan kendala di atas, berikan analisis lengkap dengan format berikut (WAJIB diikuti format ini):

                      **1. Diagnosis Kemungkinan Penyebab:**
                      [Berikan diagnosis kemungkinan penyebab kerusakan berdasarkan kendala yang disebutkan. Sebutkan beberapa kemungkinan penyebab utama dan sekunder]

                      **2. Langkah-langkah Perbaikan:**
                      [Berikan langkah-langkah perbaikan yang detail dan sistematis. Urutkan dari pemeriksaan awal hingga perbaikan akhir]

                      **3. Estimasi Biaya Spare Part:**
                      [Berikan estimasi biaya untuk spare part yang diperlukan. Sebutkan nama spare part dan estimasi harganya]

                      **4. Estimasi Waktu Pengerjaan:**
                      [Berikan estimasi waktu pengerjaan perbaikan. Sebutkan waktu untuk setiap tahap perbaikan dan total waktu keseluruhan]

                      **5. Rekomendasi Spare Part yang Diperlukan:**
                      [Berikan daftar lengkap spare part yang direkomendasikan beserta spesifikasinya jika diperlukan]

                      PENTING: Jawab dengan format yang jelas, detail, dan praktis untuk mekanik. Gunakan format markdown untuk struktur yang rapi.`;

      const result = await model.current.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      setMessages(prev => [...prev, {
        role: "assistant",
        content: text,
        isAnalysis: true,
        kendaraanData: {
          merek: kendaraan?.merek,
          plat_nomor: kendaraan?.plat_nomor,
          status: kendaraan?.status
        }
      }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Maaf, terjadi kesalahan saat menganalisis kendaraan."
      }]);
      toast.error('Gagal menganalisis kendaraan', {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setIsGeneratingAnalysis(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4 md:p-8 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-700"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header dengan Logout dan Back Button */}
        <div className="flex justify-between items-center mb-6">
          <Link
            href="/mekanik/dashboard"
            className="group/btn relative bg-white/10 backdrop-blur-md border border-white/20 text-white font-semibold px-4 py-2 rounded-full hover:bg-white/15 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Kembali</span>
          </Link>
          <button
            onClick={handleLogout}
            className="group/btn relative bg-white/10 backdrop-blur-md border border-white/20 text-white font-semibold px-4 py-2 rounded-full hover:bg-white/15 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Logout</span>
          </button>
        </div>

        {/* Chatbot Container */}
        <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 rounded-[28px] border border-white/20 shadow-2xl backdrop-blur-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 p-6 border-b border-white/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-bold text-2xl">Sagara AI</h3>
                  <p className="text-blue-200 text-sm">Asisten AI untuk mekanik - Diagnosis, Perbaikan & Estimasi</p>
                </div>
              </div>
              {selectedKendaraan && (
                <button
                  onClick={handleResetSelection}
                  className="text-blue-300 hover:text-blue-200 text-sm font-medium flex items-center gap-2 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Pilih Kendaraan Lain
                </button>
              )}
            </div>
          </div>

          {/* Messages Container */}
          <div className="h-[calc(100vh-280px)] overflow-y-auto p-6 space-y-4">
            {/* List Kendaraan - Tampilkan jika belum ada yang dipilih dan ada kendaraan */}
            {!selectedKendaraan && keruskaanAcc.length > 0 && (
              <div className="mb-6">
                <h4 className="text-white font-bold text-lg mb-4">Pilih Kendaraan untuk Analisis:</h4>
                <div className="space-y-3">
                  {keruskaanAcc.map((acc, idx) => {
                    const kendaraan = acc.kendaraan;
                    const kerusakan = acc.kerusakan;
                    return (
                      <button
                        key={acc.id || idx}
                        onClick={() => handleSelectKendaraan(acc)}
                        disabled={isGeneratingAnalysis}
                        className="w-full bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/15 hover:border-blue-400/50 transition-all duration-300 text-left disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h5 className="text-white font-bold text-lg">{kendaraan?.merek || 'N/A'}</h5>
                              <span className="text-blue-300 text-sm font-semibold bg-blue-500/20 px-2 py-1 rounded-full">
                                {kendaraan?.plat_nomor || 'N/A'}
                              </span>
                            </div>
                            {kerusakan?.catatan && (
                              <p className="text-blue-200 text-sm mb-2 line-clamp-2">{kerusakan.catatan}</p>
                            )}
                            {kerusakan?.kendala && kerusakan.kendala.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {kerusakan.kendala.slice(0, 3).map((k, i) => (
                                  <span key={i} className="text-xs bg-amber-500/20 text-amber-300 px-2 py-1 rounded-full">
                                    {k.name}
                                  </span>
                                ))}
                                {kerusakan.kendala.length > 3 && (
                                  <span className="text-xs text-blue-300">+{kerusakan.kendala.length - 3} lainnya</span>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="flex-shrink-0">
                            <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Pesan jika tidak ada kendaraan */}
            {!selectedKendaraan && keruskaanAcc.length === 0 && (
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 text-center">
                <svg className="w-16 h-16 text-blue-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-white text-lg font-semibold mb-2">Belum ada kendaraan yang ditugaskan</p>
                <p className="text-blue-200 text-sm">Tunggu admin menugaskan kendaraan untuk diperbaiki</p>
              </div>
            )}

            {/* Chat Messages */}
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl p-4 ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                      : message.isAnalysis
                        ? 'bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-sm text-white border-2 border-blue-400/30'
                        : 'bg-white/10 backdrop-blur-sm text-white border border-white/20'
                  }`}
                >
                  {message.isAnalysis && message.kendaraanData && (
                    <div className="mb-3 pb-3 border-b border-white/20">
                      <p className="text-blue-300 text-xs font-semibold mb-1">Analisis untuk:</p>
                      <p className="text-white font-bold">{message.kendaraanData.merek} - {message.kendaraanData.plat_nomor}</p>
                    </div>
                  )}
                  <div className="text-sm leading-relaxed">
                    {message.isAnalysis ? (
                      <div className="space-y-4">
                        {message.content.split(/\n/).map((line, i) => {
                          const trimmedLine = line.trim();
                          
                     
                          const headingMatch = trimmedLine.match(/^\*\*(\d+)\.\s+(.+?):\*\*$/);
                          if (headingMatch) {
                            const [, number, title] = headingMatch;
                            return (
                              <div key={i} className="mt-4 first:mt-0">
                                <h4 className="text-blue-300 font-bold text-base mb-2 flex items-center gap-2">
                                  <span className="w-6 h-6 rounded-full bg-blue-500/30 flex items-center justify-center text-xs font-bold">
                                    {number}
                                  </span>
                                  {title}
                                </h4>
                              </div>
                            );
                          }
                          
                     
                          if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**') && !trimmedLine.match(/^\*\*\d+\./)) {
                            return <strong key={i} className="text-blue-300 block mb-1">{trimmedLine.replace(/\*\*/g, '')}</strong>;
                          }
                          
                        
                          if (trimmedLine.startsWith('*') && !trimmedLine.startsWith('**')) {
                            const bulletContent = trimmedLine.replace(/^\*\s*/, '').trim();
                       
                            if (bulletContent.startsWith('**') && bulletContent.includes(':**')) {
                              const boldMatch = bulletContent.match(/^\*\*(.+?):\*\*/);
                              if (boldMatch) {
                                const boldText = boldMatch[1];
                                const remainingText = bulletContent.replace(/^\*\*.+?:\*\*\s*/, '').trim();
                        
                                const cleanRemainingText = remainingText.replace(/\*/g, '');
                                return (
                                  <div key={i} className="ml-4 mb-2 flex items-start gap-2">
                                    <span className="text-blue-400 mt-1.5">•</span>
                                    <div className="flex-1">
                                      <strong className="text-blue-300">{boldText}:</strong>
                                      {cleanRemainingText && <span className="text-white ml-1">{cleanRemainingText}</span>}
                                    </div>
                                  </div>
                                );
                              }
                            }
                  
                            const cleanContent = bulletContent.replace(/\*/g, '');
                            return (
                              <div key={i} className="ml-4 mb-2 flex items-start gap-2">
                                <span className="text-blue-400 mt-1.5">•</span>
                                <span className="text-white flex-1">{cleanContent}</span>
                              </div>
                            );
                          }
                          
                  
                          if (trimmedLine && !trimmedLine.startsWith('**') && !trimmedLine.startsWith('*')) {
                            const cleanText = trimmedLine.replace(/\*/g, '');
                            return <p key={i} className="text-white leading-relaxed mb-2">{cleanText}</p>;
                          }
                          
                          return null;
                        })}
                      </div>
                    ) : (
                      <p className="text-white whitespace-pre-wrap">{message.content}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {(isLoading || isGeneratingAnalysis) && (
              <div className="flex justify-start">
                <div className="bg-white/10 backdrop-blur-sm text-white border border-white/20 rounded-2xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                    {isGeneratingAnalysis && (
                      <span className="text-blue-300 text-sm">Menganalisis kendaraan...</span>
                    )}
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Container */}
          <div className="p-6 border-t border-white/20 bg-gradient-to-r from-blue-500/10 to-cyan-500/10">
            <div className="flex gap-3">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={selectedKendaraan ? "Tanya tentang diagnosis, perbaikan, estimasi biaya, atau spare part..." : "Pilih kendaraan terlebih dahulu untuk memulai analisis"}
                disabled={isLoading || isGeneratingAnalysis || !selectedKendaraan}
                className="flex-1 rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm py-4 px-5 text-white placeholder-blue-200 shadow-lg outline-none focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/30 transition-all disabled:opacity-50"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading || isGeneratingAnalysis || !selectedKendaraan}
                className="w-14 h-14 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg"
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }

        .animate-slide-up {
          animation: slide-up 0.6s ease-out backwards;
        }

        .delay-700 {
          animation-delay: 700ms;
        }
      `}</style>
    </div>
  );
}

