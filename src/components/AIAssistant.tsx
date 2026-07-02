import React, { useState } from "react";
import { Sparkles, Copy, RefreshCw, Send, Check, Heart, BookOpen, Palette, LayoutGrid } from "lucide-react";

interface AIAssistantProps {
  onApplyText: (field: string, text: string) => void;
  onApplyTheme?: (themeConfig: { primaryColor: string; backgroundColor: string; textColor: string; fontFamily: string }) => void;
  inviteeName?: string;
}

export default function AIAssistant({ onApplyText, onApplyTheme, inviteeName = "Nik Norizan" }: AIAssistantProps) {
  const [activeTab, setActiveTab] = useState<"wishes" | "prayers" | "theme" | "chat">("wishes");
  const [style, setStyle] = useState<"formal" | "santai" | "korporat" | "keagamaan" | "puitis">("formal");
  const [themeDescription, setThemeDescription] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");
  const [chatHistory, setChatHistory] = useState<{ role: "user" | "model"; text: string }[]>([
    { role: "model", text: "Salam! Saya Pembantu AI Reka Bentuk Kad Persaraan anda. Bagaimanakah saya boleh membantu anda menulis ucapan, doa atau merangka susunan kad hari ini?" }
  ]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [copied, setCopied] = useState(false);

  // Helper to trigger proxy endpoint
  const generateAIContent = async (promptText: string, sysInst?: string) => {
    setLoading(true);
    setResult("");
    try {
      const response = await fetch("/api/gemini/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: promptText,
          systemInstruction: sysInst || "Anda adalah pembantu AI pakar reka bentuk grafik dan penulisan ucapan persaraan berbangsa Melayu. Tulislah dalam bahasa melayu yang fasih, sopan, indah, bermutu tinggi dan tidak menggunakan istilah bahasa Indonesia."
        })
      });

      const data = await response.json();
      if (data.success) {
        setResult(data.text);
        return data.text;
      } else {
        setResult(`Ralat: ${data.error}`);
      }
    } catch (err: any) {
      setResult(`Ralat Sambungan: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateWish = async () => {
    const sysInsts = {
      formal: "Tulis ucapan persaraan formal, rasmi, penuh penghormatan untuk pesara guru/pegawai.",
      santai: "Tulis ucapan persaraan yang mesra, santai, penuh kenangan manis dan kegembiraan untuk sahabat sekerja.",
      korporat: "Tulis ucapan persaraan bertema korporat, profesional, menghargai sumbangan besar dan legasi kerja pesara.",
      keagamaan: "Tulis ucapan persaraan bersandarkan doa kesyukuran, ketenangan jiwa, keberkatan fasa pencen, penuh elemen keagamaan Islam.",
      puitis: "Tulis ucapan persaraan dalam bentuk pantun klasik atau sajak Melayu yang syahdu dan puitis."
    };

    const prompt = `Hasilkan satu perenggan ucapan persaraan dan kesyukuran yang indah untuk pesara bernama: ${inviteeName}. Pastikan ia menyentuh hati, bermutu tinggi dan sedia diletakkan dalam kad jemputan.`;
    const sysInstruction = `${sysInsts[style]} Gunakan bahasa Melayu asli Malaysia, elakkan bahasa Indonesia.`;

    const generated = await generateAIContent(prompt, sysInstruction);
    if (generated) setResult(generated);
  };

  const handleGeneratePrayer = async () => {
    const prompt = `Hasilkan satu doa persaraan ringkas yang sangat menyentuh hati (dalam 3-4 ayat) untuk pesara bernama ${inviteeName}. Doa memohon kesihatan yang berpanjangan, keberkatan fasa persaraan, kebahagiaan sekeluarga dan lindungan Allah SWT. Sesuai diletakkan di bahagian belakang kad jemputan.`;
    const sysInstruction = "Tulis doa persaraan yang indah dan khusyuk dalam bahasa Melayu Malaysia klasik yang biasa digunakan di majlis rasmi. Mulakan dengan doa kesyukuran yang mendalam.";

    const generated = await generateAIContent(prompt, sysInstruction);
    if (generated) setResult(generated);
  };

  const handleGenerateTheme = async () => {
    const desc = themeDescription || "Majlis santai bertempat di rumah kampung tradisional, bertema keindahan alam semulajadi.";
    const prompt = `Berdasarkan keterangan majlis ini: "${desc}", cadangkan satu kombinasi reka bentuk kad persaraan lengkap:
1. Warna Utama (Hex code)
2. Warna Latar Belakang (Hex code)
3. Warna Teks (Hex code)
4. Jenis Font Google yang paling padan (pilih daripada: Playfair Display, Great Vibes, Montserrat, Amiri, Cinzel, Alex Brush)
5. Alasan pemilihan.

Sila kembalikan jawapan berformat JSON ringkas dengan kunci: primaryColor, backgroundColor, textColor, fontFamily, explanation.`;

    const sysInstruction = "Kembalikan cadangan warna dan reka bentuk kad persaraan dalam format JSON sahaja. Jangan masukkan sebarang ulasan markdown luar.";

    const generated = await generateAIContent(prompt, sysInstruction);
    if (generated && onApplyTheme) {
      try {
        // Clean JSON from code blocks if model added them
        const cleanJson = generated.replace(/```json/g, "").replace(/```/g, "").trim();
        const parsed = JSON.parse(cleanJson);
        if (parsed.primaryColor && parsed.backgroundColor) {
          onApplyTheme({
            primaryColor: parsed.primaryColor,
            backgroundColor: parsed.backgroundColor,
            textColor: parsed.textColor || "#FFFFFF",
            fontFamily: parsed.fontFamily || "Playfair Display"
          });
          setResult(`🎨 Cadangan Tema AI Berhasil Diaplikasikan!\n\n- Warna Utama: ${parsed.primaryColor}\n- Warna Latar: ${parsed.backgroundColor}\n- Warna Teks: ${parsed.textColor}\n- Font: ${parsed.fontFamily}\n\nPenjelasan: ${parsed.explanation}`);
        }
      } catch (e) {
        // Fallback text output if JSON parsing failed
        setResult(generated);
      }
    }
  };

  const handleSendChatMessage = async () => {
    if (!customPrompt.trim()) return;

    const userMsg = customPrompt;
    setChatHistory((prev) => [...prev, { role: "user", text: userMsg }]);
    setCustomPrompt("");
    setLoading(true);

    try {
      const response = await fetch("/api/gemini/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: userMsg,
          systemInstruction: "Anda adalah pembantu AI Majlis Persaraan peramah, fasih Bahasa Melayu Malaysia, sedia menasihati berkenaan teks ucapan, susunan aturcara, tema pakaian majlis persaraan, dan kombinasi warna kad."
        })
      });

      const data = await response.json();
      if (data.success) {
        setChatHistory((prev) => [...prev, { role: "model", text: data.text }]);
      } else {
        setChatHistory((prev) => [...prev, { role: "model", text: `Maaf, berlaku ralat: ${data.error}` }]);
      }
    } catch (err: any) {
      setChatHistory((prev) => [...prev, { role: "model", text: `Ralat sambungan: ${err.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApplyToCardField = (field: "message" | "prayer") => {
    if (!result) return;
    onApplyText(field, result);
    alert(`Berjaya menyelitkan teks ke dalam bahagian "${field === "message" ? "Ucapan Utama" : "Doa/Harapan"}"!`);
  };

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-5 shadow-xl text-slate-100 flex flex-col h-[520px]" id="ai_assistant_panel">
      {/* Header Tabs */}
      <div className="flex items-center space-x-1.5 border-b border-white/10 pb-3 mb-4 overflow-x-auto scrollbar-none shrink-0" id="ai_tabs_header">
        <button
          onClick={() => { setActiveTab("wishes"); setResult(""); }}
          className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs transition whitespace-nowrap ${
            activeTab === "wishes" ? "bg-amber-500 text-slate-950 font-semibold" : "hover:bg-white/5 text-slate-300"
          }`}
        >
          <Heart className="w-3.5 h-3.5" />
          <span>Tulis Ucapan</span>
        </button>
        <button
          onClick={() => { setActiveTab("prayers"); setResult(""); }}
          className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs transition whitespace-nowrap ${
            activeTab === "prayers" ? "bg-amber-500 text-slate-950 font-semibold" : "hover:bg-white/5 text-slate-300"
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Tulis Doa</span>
        </button>
        <button
          onClick={() => { setActiveTab("theme"); setResult(""); }}
          className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs transition whitespace-nowrap ${
            activeTab === "theme" ? "bg-amber-500 text-slate-950 font-semibold" : "hover:bg-white/5 text-slate-300"
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>Cadang Tema</span>
        </button>
        <button
          onClick={() => setActiveTab("chat")}
          className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs transition whitespace-nowrap ${
            activeTab === "chat" ? "bg-amber-500 text-slate-950 font-semibold" : "hover:bg-white/5 text-slate-300"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Sembang AI</span>
        </button>
      </div>

      {/* Main Content Areas */}
      <div className="flex-1 overflow-y-auto min-h-0 space-y-4 pr-1">
        {/* TAB 1: WISHES */}
        {activeTab === "wishes" && (
          <div className="space-y-4">
            <div className="bg-slate-900/40 p-3 rounded-xl border border-white/5 text-xs text-slate-300 leading-relaxed">
              Pilih gaya ucapan di bawah untuk menjana ucapan persaraan menyentuh hati buat pesara <span className="font-semibold text-amber-400">{inviteeName}</span>.
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5" id="wish_style_selector">
              {(["formal", "santai", "korporat", "keagamaan", "puitis"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStyle(s)}
                  className={`py-1.5 px-2 rounded-lg text-[11px] font-medium capitalize border transition ${
                    style === s
                      ? "bg-amber-500/10 text-amber-400 border-amber-500/40"
                      : "bg-slate-800/50 text-slate-400 border-transparent hover:bg-slate-800"
                  }`}
                >
                  {s === "santai" ? "Santai" : s === "korporat" ? "Korporat" : s === "keagamaan" ? "Agama" : s === "puitis" ? "Puitis" : "Formal"}
                </button>
              ))}
            </div>

            <button
              onClick={handleGenerateWish}
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-semibold rounded-xl transition shadow-lg disabled:opacity-50"
              id="btn_generate_wish"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>Jana Ucapan Persaraan</span>
            </button>
          </div>
        )}

        {/* TAB 2: PRAYERS */}
        {activeTab === "prayers" && (
          <div className="space-y-4">
            <div className="bg-slate-900/40 p-3 rounded-xl border border-white/5 text-xs text-slate-300 leading-relaxed">
              Jana doa persaraan klasik bercorak keislaman yang syahdu dan diletakkan di bahagian belakang kad atau kandungan doa.
            </div>

            <button
              onClick={handleGeneratePrayer}
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-semibold rounded-xl transition shadow-lg disabled:opacity-50"
              id="btn_generate_prayer"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>Jana Doa Persaraan</span>
            </button>
          </div>
        )}

        {/* TAB 3: THEME */}
        {activeTab === "theme" && (
          <div className="space-y-4">
            <div className="bg-slate-900/40 p-3 rounded-xl border border-white/5 text-xs text-slate-300 leading-relaxed">
              Nyatakan konsep majlis atau minat pesara (cth: "Bunga mawar pink, gaya kaca moden", "Taman herba tradisional") untuk AI menjana palet warna harmoni secara automatik.
            </div>

            <div className="space-y-2">
              <label className="text-[11px] text-slate-400 font-medium">Huraian Konsep Majlis</label>
              <textarea
                value={themeDescription}
                onChange={(e) => setThemeDescription(e.target.value)}
                placeholder="cth: Majlis persaraan mewah warna diraja kuning emas dan biru gelap dengan motif bunga tulip..."
                className="w-full px-3.5 py-2 bg-slate-800/80 border border-slate-700 focus:border-amber-500 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition min-h-[60px]"
                id="theme_description_textarea"
              />
            </div>

            <button
              onClick={handleGenerateTheme}
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-semibold rounded-xl transition shadow-lg disabled:opacity-50"
              id="btn_generate_theme"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>Aplikasikan Palet Warna AI</span>
            </button>
          </div>
        )}

        {/* TAB 4: CHAT */}
        {activeTab === "chat" && (
          <div className="flex flex-col h-[320px] bg-slate-950/60 rounded-xl border border-white/5 overflow-hidden">
            {/* Thread Area */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-none" id="chat_thread_container">
              {chatHistory.map((chat, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col max-w-[85%] rounded-xl p-2.5 text-xs leading-relaxed ${
                    chat.role === "user"
                      ? "ml-auto bg-amber-500 text-slate-950 font-medium rounded-tr-none"
                      : "mr-auto bg-slate-800 text-slate-200 border border-slate-700/50 rounded-tl-none"
                  }`}
                >
                  <p>{chat.text}</p>
                </div>
              ))}
              {loading && (
                <div className="mr-auto bg-slate-800 rounded-xl rounded-tl-none p-2.5 text-xs text-slate-400 italic animate-pulse">
                  Gemini sedang berfikir...
                </div>
              )}
            </div>

            {/* Input Form */}
            <form
              onSubmit={(e) => { e.preventDefault(); handleSendChatMessage(); }}
              className="border-t border-white/10 p-2 flex items-center space-x-2 shrink-0 bg-slate-900/60"
            >
              <input
                type="text"
                placeholder="Tanya AI apa-apa..."
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                className="flex-1 bg-slate-800 border border-slate-700 focus:border-amber-500 rounded-lg text-xs py-1.5 px-3 focus:outline-none text-slate-100"
                id="chat_prompt_input"
              />
              <button
                type="submit"
                disabled={loading || !customPrompt.trim()}
                className="p-1.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 rounded-lg transition shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* Results display for wishes & prayers */}
        {activeTab !== "chat" && result && (
          <div className="space-y-3 bg-slate-900/60 border border-white/10 p-3.5 rounded-xl">
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-1">
                <Sparkles className="w-3 h-3" />
                <span>Hasil AI Gemini</span>
              </span>
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={handleCopy}
                  className="p-1 bg-white/5 hover:bg-white/10 rounded text-slate-300 transition"
                  title="Salin Teks"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
            
            <p className="text-xs leading-relaxed text-slate-300 bg-black/25 p-2 rounded whitespace-pre-wrap max-h-36 overflow-y-auto">
              {result}
            </p>

            {/* Quick inject options */}
            {(activeTab === "wishes" || activeTab === "prayers") && (
              <div className="flex space-x-2">
                <button
                  onClick={() => handleApplyToCardField("message")}
                  className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-semibold rounded-lg border border-slate-700 transition"
                >
                  Suntik ke Ucapan
                </button>
                <button
                  onClick={() => handleApplyToCardField("prayer")}
                  className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-semibold rounded-lg border border-slate-700 transition"
                >
                  Suntik ke Doa
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
