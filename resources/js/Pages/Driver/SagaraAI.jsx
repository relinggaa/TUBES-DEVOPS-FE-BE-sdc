import React, { useState, useEffect, useRef } from "react";
import { Link, usePage, router } from "@inertiajs/react";
import { toast } from "react-toastify";
import { GoogleGenerativeAI } from "@google/generative-ai";

export default function SagaraAI({ kendaraan = null, kerusakan = null }) {
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

  
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Halo! Saya adalah Sagara AI Ada yang bisa saya bantu?",
      showReportButton: false
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
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
      router.post('/driver/logout');
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

      const userMessages = messages.filter(m => m.role === 'user');
      const isFirstUserMessage = userMessages.length === 0;
      
   
      const chatHistory = messages
        .slice(1) 
        .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
        .join('\n');

      const context = kendaraan 
        ? `Kendaraan: ${kendaraan.merek}, Plat Nomor: ${kendaraan.plat_nomor}, Status: ${kendaraan.status}${kerusakan ? `. kendaraan anda history terakhir memiliki kerusakan dengan catatan: ${kerusakan.catatan}` : ''}`
        : 'Driver belum memiliki kendaraan';

      let prompt = `Anda adalah AI yang bernama Sagara AI berfungsi sebagai asisten AI yang membantu driver dengan masalah kendaraan. 
      Konteks: ${context}`;


      if (chatHistory.trim()) {
        prompt += `\n\nHistory percakapan sebelumnya:\n${chatHistory}`;
        prompt += `\n\nINSTRUKSI PENTING: Ini BUKAN percakapan pertama. JANGAN mengawali jawaban dengan "Halo", "Halo, saya Sagara AI", atau sapaan apapun. Langsung jawab pertanyaan user dengan jelas dan membantu tanpa menyapa.`;
      } else {
        prompt += `\n\nINSTRUKSI PENTING: Ini adalah pertanyaan pertama user setelah sapaan awal. JANGAN mengawali jawaban dengan "Halo", "Halo, saya Sagara AI", atau sapaan apapun karena Anda sudah menyapa di awal. Langsung jawab pertanyaan user dengan jelas dan membantu.`;
      }

      prompt += `\n\nPertanyaan driver: ${userMessage}
      
      Berikan jawaban yang membantu, singkat, dan relevan dengan konteks kendaraan. Jika pertanyaan tidak terkait dengan kendaraan, silakan berikan pesan bahwa saya hanya menerima topik obrolan terkait masalah kendaraan.
      
      PENTING: Jika pertanyaan user adalah tentang KENDALA atau MASALAH pada kendaraan (seperti: mobil rusak, ada masalah, tidak berfungsi, dll), di akhir jawaban Anda tambahkan teks khusus: "[LAPORKAN_KENDALA]" untuk menandai bahwa ini adalah kendala yang bisa dilaporkan.`;

      const result = await model.current.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

 
      const showReportButton = text.includes('[LAPORKAN_KENDALA]');
      const cleanText = text.replace('[LAPORKAN_KENDALA]', '').trim();


      const lastUserMessage = messages.filter(m => m.role === 'user').pop()?.content || userMessage;

      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: cleanText,
        showReportButton: showReportButton && kendaraan, 
        userQuestion: lastUserMessage 
      }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "Maaf, terjadi kesalahan.",
        showReportButton: false
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

 
  const handleLaporkanKendala = (userQuestion, aiResponse) => {
    if (!kendaraan) {
      toast.error('Anda belum memiliki kendaraan', {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }


    if (kendaraan.status === 'Pengajuan Perbaikan' || kendaraan.status === 'Perbaikan' || kendaraan.status === 'Pending') {
      toast.error('Kendaraan Anda sudah memiliki pengajuan perbaikan yang sedang diproses', {
        position: "top-right",
        autoClose: 4000,
      });
      return;
    }


    const kendalaName = userQuestion.length > 50 ? userQuestion.substring(0, 50) + '...' : userQuestion;
    const kendalaDescription = aiResponse.length > 200 ? aiResponse.substring(0, 200) + '...' : aiResponse;

    const kendalaData = [{
      name: kendalaName,
      description: kendalaDescription
    }];

    router.post('/driver/kerusakan/store-from-chat', {
      kendaraan_id: kendaraan.id,
      catatan: `Laporan dari chat AI: ${userQuestion}`,
      kendala: kendalaData
    }, {
      preserveScroll: true,
      preserveState: true,
      only: [], 
      onSuccess: () => {
      
        setMessages(prev => prev.map((msg) => 
          msg.role === 'assistant' && msg.showReportButton
            ? { ...msg, showReportButton: false }
            : msg
        ));
        

        setTimeout(() => {
          setMessages(prev => [...prev, {
            role: "assistant",
            content: "✅ Kendala Berhasil Di Laporkan! Status kendaraan Anda telah diubah menjadi 'Pengajuan Perbaikan'. Tim akan segera memproses laporan Anda.",
            showReportButton: false
          }]);
        }, 100);
      },
      onError: (errors) => {
        console.error('Error:', errors);
        const errorMessage = errors?.kendala || errors?.kendaraan_id || errors?.message || 'Gagal melaporkan kendala';
        

        setTimeout(() => {
          setMessages(prev => [...prev, {
            role: "assistant",
            content: `❌ ${errorMessage}`,
            showReportButton: false
          }]);
        }, 100);
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4 md:p-8 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-700"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-4xl mx-auto relative z-10">

        <div className="flex justify-between items-center mb-6">
          <Link
            href="/driver/dashboard"
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
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <h3 className="text-white font-bold text-2xl">Sagara AI</h3>
                <p className="text-blue-200 text-sm">Siap membantu Anda dengan masalah kendaraan</p>
              </div>
            </div>
          </div>

          {/* Messages Container */}
          <div className="h-[calc(100vh-280px)] overflow-y-auto p-6 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl p-4 ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                      : 'bg-white/10 backdrop-blur-sm text-white border border-white/20'
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                </div>
                {/* Tombol Laporkan Kendala */}
                {message.role === 'assistant' && message.showReportButton && (
                  <button
                    onClick={() => handleLaporkanKendala(message.userQuestion || '', message.content)}
                    className="mt-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold px-4 py-2 rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2 shadow-lg"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span>Laporkan Kendala</span>
                  </button>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white/10 backdrop-blur-sm text-white border border-white/20 rounded-2xl p-4">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
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
                placeholder="Tulis pesan tentang masalah kendaraan Anda..."
                disabled={isLoading}
                className="flex-1 rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm py-4 px-5 text-white placeholder-blue-200 shadow-lg outline-none focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/30 transition-all disabled:opacity-50"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
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

