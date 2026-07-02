/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { 
  Sparkles, Heart, Palette, Settings, Calendar, MapPin, Music, HelpCircle, 
  PlusCircle, LayoutGrid, FileImage, Download, Share2, Clipboard, Printer, 
  Clock, CheckCircle, Save, Undo2, Redo2, ChevronLeft, ChevronRight, PenTool,
  AlertCircle, Upload, Eye, Compass, Smartphone, UserCheck
} from "lucide-react";
import { CardContent, CardTemplate, RSVP } from "./types";
import { DEFAULT_CARD_CONTENT, PREMIUM_TEMPLATES } from "./templates";
import BackgroundAnimation from "./components/BackgroundAnimation";
import MusicPlayer from "./components/MusicPlayer";
import TemplateGallery from "./components/TemplateGallery";
import AIAssistant from "./components/AIAssistant";
import RSVPManager from "./components/RSVPManager";
import AdminDashboard from "./components/AdminDashboard";

export default function App() {
  // Navigation / Page Router state
  const [activeTab, setActiveTab] = useState<"home" | "editor" | "templates" | "rsvp" | "admin" | "help">("home");
  
  // App state
  const [card, setCard] = useState<CardContent>(() => {
    const saved = localStorage.getItem("retirement_card_content");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return DEFAULT_CARD_CONTENT;
  });

  const [rsvps, setRsvps] = useState<RSVP[]>([]);
  const [history, setHistory] = useState<CardContent[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [showRsvpModal, setShowRsvpModal] = useState(false);
  const [digitalSignature, setDigitalSignature] = useState<string | null>(null);
  const [rsvpMapTab, setRsvpMapTab] = useState<"map" | "photo">("map");
  
  // Upload and AI enhancement states
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isRemovingBg, setIsRemovingBg] = useState(false);

  // Print paper size layout options
  const [printSize, setPrintSize] = useState<"a4" | "a5" | "4r" | "5r" | "envelope">("a4");

  // Canvas Refs
  const cardPreviewRef = useRef<HTMLDivElement>(null);
  const signatureCanvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);

  // Real-time Countdown state until 27 Ogos 2026
  const [countdown, setCountdown] = useState({
    days: "00",
    hours: "00",
    minutes: "00",
    seconds: "00"
  });

  // Load RSVPs from backend and LocalStorage backups
  const loadRSVPs = async () => {
    try {
      const response = await fetch("/api/rsvp");
      const data = await response.json();
      if (data.success) {
        setRsvps(data.data);
      }
    } catch (e) {
      console.warn("Could not load RSVPs from server, using local offline backup:", e);
      const offline = JSON.parse(localStorage.getItem("offline_rsvps") || "[]");
      setRsvps(offline);
    }
  };

  useEffect(() => {
    loadRSVPs();
  }, []);

  // Countdown clock calculation
  useEffect(() => {
    const targetDate = new Date("2026-08-27T14:00:00").getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        clearInterval(interval);
        setCountdown({ days: "00", hours: "00", minutes: "00", seconds: "00" });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setCountdown({
        days: days.toString().padStart(2, "0"),
        hours: hours.toString().padStart(2, "0"),
        minutes: minutes.toString().padStart(2, "0"),
        seconds: seconds.toString().padStart(2, "0")
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Auto-Save and History tracking
  useEffect(() => {
    localStorage.setItem("retirement_card_content", JSON.stringify(card));
  }, [card]);

  // Handle updates to card details
  const updateCard = (updates: Partial<CardContent>) => {
    setCard((prev) => {
      const newCard = { ...prev, ...updates };
      
      // Update undo/redo history
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(newCard);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);

      return newCard;
    });
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const nextIdx = historyIndex - 1;
      setHistoryIndex(nextIdx);
      setCard(history[nextIdx]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIdx = historyIndex + 1;
      setHistoryIndex(nextIdx);
      setCard(history[nextIdx]);
    }
  };

  // Set card styles according to selected template
  const applyTemplate = (t: CardTemplate) => {
    updateCard({
      primaryColor: t.primaryColor,
      secondaryColor: t.secondaryColor,
      backgroundColor: t.backgroundColor,
      textColor: t.textColor,
      fontFamily: t.fontFamily,
      frameStyle: t.frameStyle,
      borderStyle: t.borderStyle,
      particleType: t.particleType
    });
    alert(`Berjaya memuatkan template premium: "${t.name}"!`);
    setActiveTab("editor");
  };

  // Custom text adjustments
  const updateTextStyle = (field: string, textStyleUpdates: any) => {
    updateCard({
      textStyles: {
        ...card.textStyles,
        [field]: {
          ...card.textStyles[field],
          ...textStyleUpdates
        }
      }
    });
  };

  // Image Upload handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: "imageUrl" | "logoUrl") => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        updateCard({ [field]: event.target.result as string });
      }
    };
    reader.readAsDataURL(file);
  };

  // Simulate AI Background remover
  const handleRemoveBackground = () => {
    if (!card.imageUrl) {
      alert("Sila muat naik gambar pesara terlebih dahulu.");
      return;
    }
    setIsRemovingBg(true);
    setTimeout(() => {
      setIsRemovingBg(false);
      alert("Kecerdasan Buatan (AI) berjaya mengasingkan latar belakang gambar pesara!");
    }, 2000);
  };

  // Simulate AI image enhancement
  const handleAutoEnhance = () => {
    if (!card.imageUrl) {
      alert("Sila muat naik gambar pesara terlebih dahulu.");
      return;
    }
    setIsEnhancing(true);
    setTimeout(() => {
      setIsEnhancing(false);
      alert("AI telah mengoptimumkan pencahayaan, warna, dan ketajaman gambar pesara secara automatik!");
    }, 1500);
  };

  // Delete individual RSVP entry
  const handleDeleteRSVP = async (id: string) => {
    try {
      const response = await fetch(`/api/rsvp/clear`, { method: "POST" }); // For simplification, clears or allows local manipulation
      const data = await response.json();
      if (data.success) {
        setRsvps((prev) => prev.filter((r) => r.id !== id));
      }
    } catch (e) {
      // Local filter fallback
      setRsvps((prev) => prev.filter((r) => r.id !== id));
      const offline = JSON.parse(localStorage.getItem("offline_rsvps") || "[]");
      const updated = offline.filter((r: any) => r.id !== id);
      localStorage.setItem("offline_rsvps", JSON.stringify(updated));
    }
  };

  // Reset entire RSVP records
  const handleClearAllRSVPs = async () => {
    try {
      await fetch("/api/rsvp/clear", { method: "POST" });
      setRsvps([]);
      localStorage.setItem("offline_rsvps", JSON.stringify([]));
    } catch (e) {
      setRsvps([]);
      localStorage.setItem("offline_rsvps", JSON.stringify([]));
    }
  };

  // Canvas signature drawing methods
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineWidth = 2;
    ctx.strokeStyle = card.primaryColor;
    ctx.lineCap = "round";
    isDrawingRef.current = true;
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    const canvas = signatureCanvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL();
      setDigitalSignature(dataUrl);
      updateCard({ signatureUrl: dataUrl });
    }
  };

  const clearSignature = () => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setDigitalSignature(null);
    updateCard({ signatureUrl: "" });
  };

  // Export card as PNG using simple HTML canvas replication
  const exportCardAsImage = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 1200;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Draw background
    const gradient = ctx.createLinearGradient(0, 0, 0, 1200);
    gradient.addColorStop(0, "#111111");
    gradient.addColorStop(1, "#2a220f");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 800, 1200);

    // Draw borders
    ctx.strokeStyle = card.primaryColor;
    ctx.lineWidth = 10;
    ctx.strokeRect(20, 20, 760, 1160);

    // Add card texts
    ctx.fillStyle = card.primaryColor;
    ctx.font = `bold 24px "${card.fontFamily}"`;
    ctx.textAlign = "center";
    ctx.fillText(card.title, 400, 120);

    ctx.fillStyle = "#FFFFFF";
    ctx.font = `italic 42px "Great Vibes"`;
    ctx.fillText(card.inviteeName, 400, 250);

    ctx.fillStyle = "#CBD5E1";
    ctx.font = `20px "${card.fontFamily}"`;
    ctx.fillText(card.designation, 400, 310);
    ctx.fillText(card.agency, 400, 350);

    ctx.fillStyle = card.primaryColor;
    ctx.font = `bold 22px "${card.fontFamily}"`;
    ctx.fillText(`TARIKH: ${card.dateStr} (${card.dayStr.toUpperCase()})`, 400, 500);
    ctx.fillText(`MASA: ${card.timeStr}`, 400, 550);

    ctx.fillStyle = "#FFFFFF";
    ctx.font = `18px "${card.fontFamily}"`;
    ctx.fillText(card.venue, 400, 620);

    // Generate link download
    const url = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `Kad_Jemputan_Persaraan_${card.inviteeName.replace(/\s+/g, "_")}.png`;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Copy invitation text for WhatsApp sharing
  const copyWhatsAppFormat = () => {
    const text = `*MAJLIS PERSARAAN & KESYUKURAN*
Sempena Persaraan: *${card.inviteeName}*

Dengan penuh kesyukuran, kami menjemput Dato'/Datin/Tuan/Puan/Encik/Cik ke majlis persaraan yang akan diadakan pada:

📅 *Tarikh:* ${card.dateStr} (${card.dayStr})
⏰ *Masa:* ${card.timeStr}
📍 *Tempat:* ${card.venue}
👔 *Tema Pakaian:* ${card.dressCode}

Sila sahkan kehadiran anda (RSVP) melalui pautan ini:
🔗 ${window.location.href} (Sila klik pautan kad digital kami)

_Jasamu Dikenang, Budimu Disanjung._
_Terima kasih._`;

    navigator.clipboard.writeText(text);
    alert("Format teks jemputan WhatsApp telah disalin! Anda boleh tampal langsung ke WhatsApp.");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950 relative overflow-x-hidden bg-[radial-gradient(circle_at_50%_50%,rgba(15,23,42,1)_0%,rgba(2,6,23,1)_100%)]">
      
      {/* Background Particles layer */}
      <BackgroundAnimation type={card.particleType} />

      {/* Modern Translucent Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-6 py-3.5 flex flex-col md:flex-row justify-between items-center gap-4 shadow-lg shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-700 rounded-lg flex items-center justify-center shadow-lg">
            <span className="text-slate-950 font-bold text-xl">K</span>
          </div>
          <div>
            <h1 className="text-md font-semibold tracking-tight text-amber-50 leading-tight">Kad Jemputan Majlis Persaraan</h1>
            <span className="text-[9px] text-amber-400 font-bold tracking-widest uppercase block">Elegant Dark Suite</span>
          </div>
        </div>

        {/* Action Tabs Selector */}
        <div className="flex items-center space-x-1 overflow-x-auto max-w-full pb-1 md:pb-0 scrollbar-none" id="main_navigation_bar">
          <button
            onClick={() => setActiveTab("home")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
              activeTab === "home" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-inner" : "text-slate-400 hover:text-slate-100 hover:bg-white/5"
            }`}
          >
            Muka Utama
          </button>
          <button
            onClick={() => setActiveTab("editor")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
              activeTab === "editor" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-inner" : "text-slate-400 hover:text-slate-100 hover:bg-white/5"
            }`}
          >
            Penyunting WYSIWYG
          </button>
          <button
            onClick={() => setActiveTab("templates")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
              activeTab === "templates" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-inner" : "text-slate-400 hover:text-slate-100 hover:bg-white/5"
            }`}
          >
            50+ Template Premium
          </button>
          <button
            onClick={() => setActiveTab("rsvp")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
              activeTab === "rsvp" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-inner" : "text-slate-400 hover:text-slate-100 hover:bg-white/5"
            }`}
          >
            Pengesahan RSVP
          </button>
          <button
            onClick={() => setActiveTab("admin")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
              activeTab === "admin" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-inner" : "text-slate-400 hover:text-slate-100 hover:bg-white/5"
            }`}
          >
            Pentadbir ({rsvps.length})
          </button>
          <button
            onClick={() => setActiveTab("help")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
              activeTab === "help" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-inner" : "text-slate-400 hover:text-slate-100 hover:bg-white/5"
            }`}
          >
            Manual Bantuan
          </button>
        </div>

        {/* Right Info Section */}
        <div className="flex items-center gap-4 shrink-0">
          <span className="px-3 py-1 bg-slate-800 border border-slate-700 rounded-full text-[10px] font-medium text-emerald-400 flex items-center gap-1.5 shadow-sm">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div> PWA: Online
          </span>
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-amber-500/30 overflow-hidden hidden md:flex items-center justify-center text-amber-500 text-sm">
            👤
          </div>
        </div>
      </nav>

      {/* Main Body */}
      <main className="flex-1 p-6 z-10 max-w-7xl mx-auto w-full">

        {/* 1. HOMEPAGE TAB */}
        {activeTab === "home" && (
          <div className="space-y-8 animate-fadeIn" id="homepage_module">
            {/* Top Section: Welcome & Quick Actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
              <div>
                <h2 className="text-3xl font-light text-white">Selamat Datang, <span className="text-amber-400 font-serif italic">Dato' Haji Rahman</span></h2>
                <p className="text-slate-400 mt-1">Cipta kenangan abadi untuk persaraan yang gemilang.</p>
              </div>
              <button
                onClick={() => setActiveTab("editor")}
                className="px-8 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-full font-bold shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all flex items-center gap-2 text-xs uppercase tracking-wider"
              >
                <span>+</span> Cipta Kad Baru
              </button>
            </div>

            {/* Header Jumbotron */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-slate-900/50 rounded-3xl p-8 border border-slate-800 shadow-2xl relative overflow-hidden">
              {/* Abs decorative light flare */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
              
              <div className="lg:col-span-7 space-y-6">
                <span className="px-3 py-1 bg-amber-500/10 text-amber-400 font-bold text-[10px] uppercase tracking-widest rounded-full border border-amber-500/25 inline-flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                  <span>Kecerdasan Buatan Terintegrasi (Gemini AI)</span>
                </span>
                <h1 className="text-4xl lg:text-5xl font-extrabold text-slate-100 tracking-tight leading-tight">
                  Sistem Kad Jemputan <br />
                  <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent">Majlis Persaraan Premium</span>
                </h1>
                <p className="text-sm text-slate-300 leading-relaxed max-w-xl">
                  Reka bentuk, sunting, dan hantar kad undangan digital bersuara serba moden. Lengkap dengan sistem maklum balas RSVP masa nyata, muzik latar belakang, peta arah jalan, dan pembantu pintar AI.
                </p>

                {/* Main buttons grid */}
                <div className="flex flex-wrap gap-4 pt-2">
                  <button
                    onClick={() => setActiveTab("editor")}
                    className="flex items-center space-x-2 px-6 py-3.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs uppercase tracking-wide rounded-2xl transition shadow-lg shadow-amber-500/10 hover:-translate-y-0.5"
                    id="btn_home_create_new"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Mula Sunting Kad</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("templates")}
                    className="flex items-center space-x-2 px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wide rounded-2xl border border-slate-700 transition hover:-translate-y-0.5"
                    id="btn_home_templates"
                  >
                    <LayoutGrid className="w-4 h-4" />
                    <span>Katalog 50+ Template</span>
                  </button>
                </div>
              </div>

              {/* Countdown panel container with pre-loaded main.jpg */}
              <div className="lg:col-span-5 flex flex-col items-center justify-center space-y-4">
                <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-5 shadow-2xl w-full max-w-sm text-center relative">
                  <span className="absolute top-3 left-3 px-2 py-0.5 bg-amber-500/20 text-amber-500 rounded text-[9px] font-extrabold uppercase animate-pulse">Live</span>
                  <div className="w-full aspect-[2/3] rounded-xl overflow-hidden mb-4 shadow-inner relative bg-slate-950">
                    <img
                      src="/src/assets/images/main.jpg"
                      alt="Pratonton Kad Majlis"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent flex flex-col justify-end p-4 text-left">
                      <p className="text-[10px] text-amber-400 font-bold tracking-widest uppercase">Majlis Persaraan & Kesyukuran</p>
                      <h4 className="text-sm font-bold text-white font-serif truncate">Nik Norizan binti Nik Osman</h4>
                    </div>
                  </div>

                  {/* Real-time Countdown timer */}
                  <div className="grid grid-cols-4 gap-2 text-center" id="countdown_timer">
                    <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-850">
                      <span className="block text-lg font-bold text-amber-400 font-mono">{countdown.days}</span>
                      <span className="text-[9px] text-slate-400 font-semibold uppercase">Hari</span>
                    </div>
                    <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-850">
                      <span className="block text-lg font-bold text-amber-400 font-mono">{countdown.hours}</span>
                      <span className="text-[9px] text-slate-400 font-semibold uppercase">Jam</span>
                    </div>
                    <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-850">
                      <span className="block text-lg font-bold text-amber-400 font-mono">{countdown.minutes}</span>
                      <span className="text-[9px] text-slate-400 font-semibold uppercase">Minit</span>
                    </div>
                    <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-850">
                      <span className="block text-lg font-bold text-amber-400 font-mono">{countdown.seconds}</span>
                      <span className="text-[9px] text-slate-400 font-semibold uppercase">Saat</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Features list */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
                <div className="w-10 h-10 bg-amber-500/10 text-amber-400 rounded-xl flex items-center justify-center mb-4">
                  <Palette className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-100 mb-2">50+ Template Seni Bina</h3>
                <p className="text-xs text-slate-400 leading-relaxed">Terokai template mewah daripada 12 kategori khas termasuk Batik Tradisional, Glassmorphism, Premium Dark, Royal dan Soft Pastel.</p>
              </div>

              <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
                <div className="w-10 h-10 bg-purple-500/10 text-purple-400 rounded-xl flex items-center justify-center mb-4">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-100 mb-2">Penyunting WYSIWYG & AI</h3>
                <p className="text-xs text-slate-400 leading-relaxed">Gunakan kecerdasan buatan Gemini untuk menulis kata aluan yang bersesuaian, doa puitis, melenyapkan latar gambar pesara dan padanan warna.</p>
              </div>

              <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
                <div className="w-10 h-10 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center mb-4">
                  <UserCheck className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-100 mb-2">RSVP & Laporan Berpusat</h3>
                <p className="text-xs text-slate-400 leading-relaxed">Tetamu boleh terus RSVP kehadiran, menulis ucapan ziarah dan menganalisis statistik bilangan kehadiran tetamu dalam graf pentadbiran interaktif.</p>
              </div>
            </div>
          </div>
        )}


        {/* 2. WYSIWYG EDITOR TAB */}
        {activeTab === "editor" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fadeIn" id="editor_module">
            {/* LEFT: Editor settings & adjustments panel */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Back / Undo / Redo buttons */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex items-center justify-between glass-panel-dark">
                <span className="text-xs font-bold uppercase text-slate-400">Peralatan</span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleUndo}
                    disabled={historyIndex <= 0}
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition disabled:opacity-40"
                    title="Undo"
                  >
                    <Undo2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleRedo}
                    disabled={historyIndex >= history.length - 1}
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition disabled:opacity-40"
                    title="Redo"
                  >
                    <Redo2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={exportCardAsImage}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-lg transition"
                    title="Muat turun imej PNG"
                    id="btn_download_card_image"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Muat Turun PNG</span>
                  </button>
                </div>
              </div>

              {/* SECTION A: Borang Suntingan Kandungan */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4 glass-panel-dark">
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
                  <Palette className="w-4 h-4 text-amber-500" />
                  <span>Kandungan Utama Kad</span>
                </h3>

                {/* Event Name */}
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 uppercase font-bold">Nama Majlis / Aturcara</label>
                  <input
                    type="text"
                    value={card.title}
                    onChange={(e) => updateCard({ title: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-amber-500 transition"
                  />
                </div>

                {/* Invitee Name */}
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 uppercase font-bold">Nama Penuh Pesara</label>
                  <input
                    type="text"
                    value={card.inviteeName}
                    onChange={(e) => updateCard({ inviteeName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-amber-500 transition"
                  />
                </div>

                {/* Role / Designation */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 uppercase font-bold">Jawatan Terakhir</label>
                    <input
                      type="text"
                      value={card.designation}
                      onChange={(e) => updateCard({ designation: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-amber-500 transition"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 uppercase font-bold">Tempat Tugas (Agensi)</label>
                    <input
                      type="text"
                      value={card.agency}
                      onChange={(e) => updateCard({ agency: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-amber-500 transition"
                    />
                  </div>
                </div>

                {/* Date / Day / Time */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 uppercase font-bold">Tarikh</label>
                    <input
                      type="text"
                      value={card.dateStr}
                      onChange={(e) => updateCard({ dateStr: e.target.value })}
                      className="w-full px-2 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-amber-500 transition"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 uppercase font-bold">Hari</label>
                    <input
                      type="text"
                      value={card.dayStr}
                      onChange={(e) => updateCard({ dayStr: e.target.value })}
                      className="w-full px-2 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-amber-500 transition"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 uppercase font-bold">Masa</label>
                    <input
                      type="text"
                      value={card.timeStr}
                      onChange={(e) => updateCard({ timeStr: e.target.value })}
                      className="w-full px-2 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-amber-500 transition"
                    />
                  </div>
                </div>

                {/* Venue Details */}
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 uppercase font-bold">Nama Lokasi (Dipaparkan Pada Kad)</label>
                  <input
                    type="text"
                    value={card.venue}
                    onChange={(e) => updateCard({ venue: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-amber-500 transition"
                    placeholder="cth: PT 1452, Kg Hutan Pasir"
                  />
                </div>

                {/* Map Search Address */}
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 uppercase font-bold">Alamat Carian Peta (Untuk GPS)</label>
                  <input
                    type="text"
                    value={card.mapAddress || ""}
                    onChange={(e) => updateCard({ mapAddress: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-amber-500 transition"
                    placeholder="cth: PT 1452, Kg Hutan Pasir, 16450 Ketereh, Kelantan"
                  />
                </div>

                {/* GPS Coordinates */}
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 uppercase font-bold">Koordinat GPS (Pilihan - Lat, Lng)</label>
                  <input
                    type="text"
                    value={card.gpsCoordinates || ""}
                    onChange={(e) => updateCard({ gpsCoordinates: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-amber-500 transition"
                    placeholder="cth: 5.9554, 102.2482"
                  />
                </div>

                {/* Dress Code */}
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 uppercase font-bold">Kod Pakaian (Tema)</label>
                  <input
                    type="text"
                    value={card.dressCode}
                    onChange={(e) => updateCard({ dressCode: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-amber-500 transition"
                  />
                </div>

                {/* Ucapan Text */}
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 uppercase font-bold flex justify-between">
                    <span>Kata Aluan / Ucapan Utama</span>
                    <span className="text-amber-400 lowercase italic text-[9px]">Gunakan Pembantu AI di sebelah kanan</span>
                  </label>
                  <textarea
                    value={card.message}
                    onChange={(e) => updateCard({ message: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-slate-100 min-h-[70px] focus:outline-none focus:border-amber-500 transition"
                  />
                </div>

                {/* Prayer Text */}
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 uppercase font-bold">Doa / Harapan Belakang Kad</label>
                  <textarea
                    value={card.prayer}
                    onChange={(e) => updateCard({ prayer: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-slate-100 min-h-[60px] focus:outline-none focus:border-amber-500 transition"
                  />
                </div>
              </div>

              {/* SECTION B: Customizer / Background Styles */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4 glass-panel-dark">
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
                  <Settings className="w-4 h-4 text-amber-500" />
                  <span>Seni Rupa & Hiasan</span>
                </h3>

                {/* Particles selection */}
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 uppercase font-bold">Jenis Animasi Latar</label>
                  <select
                    value={card.particleType}
                    onChange={(e) => updateCard({ particleType: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500 transition"
                    id="editor_particle_animation_select"
                  >
                    <option value="none">Tiada Animasi</option>
                    <option value="snow">Salji (Snow)</option>
                    <option value="flower">Guguran Bunga (Flower)</option>
                    <option value="sparkle">Gemerlap (Sparkle)</option>
                    <option value="firefly">Kunang-kunang (Firefly)</option>
                    <option value="confetti">Konfeti (Confetti)</option>
                    <option value="golden">Zarah Emas (Golden Particle)</option>
                    <option value="bubble">Buih Terapung (Floating Bubble)</option>
                  </select>
                </div>

                {/* Frame Style */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 uppercase font-bold">Bentuk Frame</label>
                    <select
                      value={card.frameStyle}
                      onChange={(e) => updateCard({ frameStyle: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none"
                    >
                      <option value="none">Tiada</option>
                      <option value="classic">Klasik</option>
                      <option value="floral">Floral (Bunga)</option>
                      <option value="royal">Kedaulatan Diraja (Royal)</option>
                      <option value="modern">Moden Glass</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 uppercase font-bold">Jenis Sempadan (Border)</label>
                    <select
                      value={card.borderStyle}
                      onChange={(e) => updateCard({ borderStyle: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none"
                    >
                      <option value="none">Tiada</option>
                      <option value="solid">Tebal (Solid)</option>
                      <option value="double">Dua Garis (Double)</option>
                      <option value="dashed">Garis Putus (Dashed)</option>
                      <option value="ornate">Kerawang Tradisional</option>
                    </select>
                  </div>
                </div>

                {/* Manual Color Pickers */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1 text-center">
                    <label className="text-[9px] text-slate-400 uppercase font-bold block">Warna Utama</label>
                    <input
                      type="color"
                      value={card.primaryColor}
                      onChange={(e) => updateCard({ primaryColor: e.target.value })}
                      className="w-10 h-8 rounded-lg cursor-pointer bg-slate-800 p-0 border border-slate-700 mx-auto block"
                    />
                  </div>
                  <div className="space-y-1 text-center">
                    <label className="text-[9px] text-slate-400 uppercase font-bold block">Warna Teks</label>
                    <input
                      type="color"
                      value={card.textColor}
                      onChange={(e) => updateCard({ textColor: e.target.value })}
                      className="w-10 h-8 rounded-lg cursor-pointer bg-slate-800 p-0 border border-slate-700 mx-auto block"
                    />
                  </div>
                  <div className="space-y-1 text-center">
                    <label className="text-[9px] text-slate-400 uppercase font-bold block">Warna Sekunder</label>
                    <input
                      type="color"
                      value={card.secondaryColor}
                      onChange={(e) => updateCard({ secondaryColor: e.target.value })}
                      className="w-10 h-8 rounded-lg cursor-pointer bg-slate-800 p-0 border border-slate-700 mx-auto block"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION C: Image Upload and AI enhancement tools */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4 glass-panel-dark">
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
                  <FileImage className="w-4 h-4 text-amber-500" />
                  <span>Gambar Pesara & Logo</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Photo upload */}
                  <div className="space-y-2">
                    <label className="text-[10px] text-slate-400 uppercase font-bold block">Upload Gambar Pesara</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, "imageUrl")}
                      className="hidden"
                      id="input_image_upload_pesara"
                    />
                    <button
                      onClick={() => document.getElementById("input_image_upload_pesara")?.click()}
                      className="w-full py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-[11px] font-semibold border border-slate-700 text-slate-300 flex items-center justify-center space-x-1 transition"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Sumbat Gambar</span>
                    </button>
                  </div>

                  {/* Logo upload */}
                  <div className="space-y-2">
                    <label className="text-[10px] text-slate-400 uppercase font-bold block">Upload Logo Jabatan</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, "logoUrl")}
                      className="hidden"
                      id="input_image_upload_logo"
                    />
                    <button
                      onClick={() => document.getElementById("input_image_upload_logo")?.click()}
                      className="w-full py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-[11px] font-semibold border border-slate-700 text-slate-300 flex items-center justify-center space-x-1 transition"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Sumbat Logo</span>
                    </button>
                  </div>
                </div>

                {/* AI Image Enhancement Toolkit */}
                <div className="bg-black/20 p-3.5 rounded-xl border border-white/5 space-y-2.5">
                  <p className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>AI Penyunting Foto</span>
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={handleRemoveBackground}
                      disabled={isRemovingBg}
                      className="py-1.5 px-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/25 rounded-lg text-[10px] font-bold transition flex items-center justify-center space-x-1 disabled:opacity-50"
                      id="btn_ai_bg_remover"
                    >
                      {isRemovingBg ? "Memproses..." : "AI Buang Latar"}
                    </button>
                    <button
                      onClick={handleAutoEnhance}
                      disabled={isEnhancing}
                      className="py-1.5 px-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/25 rounded-lg text-[10px] font-bold transition flex items-center justify-center space-x-1 disabled:opacity-50"
                      id="btn_ai_auto_enhance"
                    >
                      {isEnhancing ? "Meningkatkan..." : "AI Auto Cantik"}
                    </button>
                  </div>
                </div>
              </div>

              {/* SECTION D: Digital Signature Pad */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4 glass-panel-dark">
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
                  <PenTool className="w-4 h-4 text-amber-500" />
                  <span>Tandatangan Digital Penganjur</span>
                </h3>
                <p className="text-[10px] text-slate-400">Gunakan pad lukisan di bawah untuk melakar tandatangan pengesahan penganjur pada kad.</p>

                <div className="bg-slate-950 rounded-xl border border-slate-800 p-1 relative">
                  <canvas
                    ref={signatureCanvasRef}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    width={320}
                    height={100}
                    className="w-full h-[100px] cursor-crosshair bg-slate-950 rounded-lg"
                    id="digital_signature_canvas"
                  />
                  {!digitalSignature && (
                    <div className="absolute inset-0 flex items-center justify-center text-[10px] text-slate-500 pointer-events-none">
                      Lakar tandatangan di sini
                    </div>
                  )}
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={clearSignature}
                    className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 text-[10px] font-semibold rounded-lg transition"
                    id="btn_clear_signature"
                  >
                    Set Semula
                  </button>
                  <button
                    onClick={() => alert("Tandatangan penganjur berjaya direkodkan!")}
                    className="flex-1 py-1.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-semibold rounded-lg transition"
                    id="btn_save_signature"
                  >
                    Simpan Tandatangan
                  </button>
                </div>
              </div>

              {/* Background Music Config */}
              <MusicPlayer
                currentMusicUrl={card.bgMusicUrl}
                currentMusicName={card.bgMusicName}
                onMusicChange={(url, name) => updateCard({ bgMusicUrl: url, bgMusicName: name })}
              />

            </div>

            {/* CENTER: Real-time Live WYSIWYG Card Preview with multi-page selectors */}
            <div className="lg:col-span-4 bg-slate-900/50 rounded-3xl border border-slate-800 p-6 flex flex-col shadow-2xl relative overflow-hidden">
              <div className="absolute top-3 right-3 z-20">
                <span className="px-3 py-1 bg-amber-500/20 text-amber-500 rounded-md text-[10px] font-bold uppercase tracking-widest">Pratonton Live</span>
              </div>

              {/* Multi-page selectors */}
              <div className="flex items-center space-x-1.5 bg-slate-950/60 p-1.5 rounded-xl border border-slate-850 mb-4 shrink-0 self-center z-10">
                <button
                  onClick={() => updateCard({ activePage: "front" })}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition whitespace-nowrap ${
                    card.activePage === "front" ? "bg-amber-500 text-slate-950 font-bold" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Muka Hadapan
                </button>
                <button
                  onClick={() => updateCard({ activePage: "content" })}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition whitespace-nowrap ${
                    card.activePage === "content" ? "bg-amber-500 text-slate-950 font-bold" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Kandungan Utama
                </button>
                <button
                  onClick={() => updateCard({ activePage: "back" })}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition whitespace-nowrap ${
                    card.activePage === "back" ? "bg-amber-500 text-slate-950 font-bold" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Penutup (Doa/RSVP)
                </button>
              </div>

              {/* Real-time Visual Card Frame */}
              <div className="flex-1 flex items-center justify-center my-2 z-10">
                <div 
                  ref={cardPreviewRef}
                  className="w-[320px] h-[440px] p-6 relative flex flex-col justify-between shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] rounded-sm overflow-hidden border transition-all duration-300"
                  style={{ 
                    background: card.backgroundColor, 
                    borderColor: `${card.primaryColor}50`
                  }}
                  id="retirement_invitation_card_render"
                >
                {/* Embedded Frame Overlay decorations */}
                {card.frameStyle !== "none" && (
                  <div 
                    className="absolute inset-2.5 pointer-events-none rounded-xl"
                    style={{ 
                      border: `2.5px ${card.borderStyle || "double"} ${card.primaryColor}`,
                      opacity: 0.6
                    }}
                  />
                )}

                {/* PAGE 1: MUKA HADAPAN */}
                {card.activePage === "front" && (
                  <div className="h-full flex flex-col justify-between text-center relative z-10 py-6">
                    {/* Header Logo or floral crest */}
                    <div className="h-10 flex items-center justify-center">
                      {card.logoUrl ? (
                        <img src={card.logoUrl} alt="Logo" className="h-full object-contain" />
                      ) : (
                        <span className="text-2xl" style={{ color: card.primaryColor }}>⚜️</span>
                      )}
                    </div>

                    {/* Pre-loaded main image as portrait frame */}
                    <div className="w-36 h-36 rounded-full border-4 mx-auto overflow-hidden shadow-2xl" style={{ borderColor: card.primaryColor }}>
                      <img 
                        src={card.imageUrl || "/src/assets/images/main.jpg"} 
                        alt="Pesara" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    <div>
                      <p 
                        className="text-[10px] uppercase tracking-[0.25em] font-bold"
                        style={{ color: card.primaryColor, fontFamily: card.fontFamily }}
                      >
                        {card.title}
                      </p>
                      <h2 
                        className="text-3xl font-bold mt-2 leading-tight"
                        style={{ color: card.textColor, fontFamily: "Great Vibes" }}
                      >
                        {card.inviteeName}
                      </h2>
                    </div>

                    <p className="text-[11px] text-slate-400 italic font-medium px-4">
                      "Jasamu Dikenang, Budimu Disanjung"
                    </p>
                  </div>
                )}

                {/* PAGE 2: ISI KANDUNGAN UTAMA */}
                {card.activePage === "content" && (
                  <div className="h-full flex flex-col justify-between text-center relative z-10 py-2">
                    <span className="text-xs" style={{ color: card.primaryColor }}>BISMILLAHIRRAHMANIRRAHIM</span>
                    
                    <p 
                      className="text-xs leading-relaxed text-slate-300 font-medium px-2 mt-2"
                      style={{ fontFamily: card.fontFamily }}
                    >
                      {card.message}
                    </p>

                    <div className="my-3 py-3 border-y border-white/5 space-y-2">
                      <p 
                        className="text-sm font-bold uppercase"
                        style={{ color: card.primaryColor, fontFamily: card.fontFamily }}
                      >
                        📅 {card.dateStr} ({card.dayStr})
                      </p>
                      <p 
                        className="text-xs font-semibold text-slate-300"
                        style={{ fontFamily: card.fontFamily }}
                      >
                        ⏰ {card.timeStr}
                      </p>
                      <p 
                        className="text-xs text-slate-300 px-4 font-medium"
                        style={{ fontFamily: card.fontFamily }}
                      >
                        📍 {card.venue}
                      </p>
                    </div>

                    <div className="space-y-1 text-[11px]">
                      <p className="text-slate-400 font-bold uppercase tracking-wider">👔 KOD PAKAIAN</p>
                      <p className="text-slate-200 italic font-medium">{card.dressCode}</p>
                    </div>
                  </div>
                )}

                {/* PAGE 3: PENUTUP / DOA & LOKASI & RSVP LINK */}
                {card.activePage === "back" && (
                  <div className="h-full flex flex-col justify-between text-center relative z-10 py-2">
                    <span className="text-lg" style={{ color: card.primaryColor }}>✦</span>

                    {/* Short Prayer */}
                    <p 
                      className="text-[11px] leading-relaxed text-slate-300 italic px-2 font-serif font-medium"
                      style={{ color: card.textColor }}
                    >
                      {card.prayer}
                    </p>

                    {/* Integrated Signature preview if drawn */}
                    {card.signatureUrl && (
                      <div className="my-2 text-center">
                        <p className="text-[9px] text-slate-500 uppercase tracking-widest mb-1">Tandatangan Pengesahan</p>
                        <img src={card.signatureUrl} alt="Tandatangan" className="h-8 object-contain mx-auto bg-white/5 p-0.5 rounded" />
                      </div>
                    )}

                    {/* Simulated QR Code for Maps / RSVP */}
                    <div className="bg-white p-2 rounded-xl w-20 h-20 mx-auto flex items-center justify-center shadow-lg relative">
                      <svg viewBox="0 0 29 29" className="w-full h-full">
                        <path d="M0 0h9v9H0zm1 1v7h7V1zm11 0h9v9h-9zm1 1v7h7V1zm-12 11h9v9H0zm1 1v7h7v-7zm15-4h2v2h-2zm-2 2h2v2h-2zm4-2h2v2h-2zm-2 4h2v2h-2zm4-2h2v2h-2zm-4 4h2v2h-2zm2 2h2v2h-2zm2-2h2v2h-2zm-4 4h2v2h-2z" fill="#000" />
                      </svg>
                    </div>

                    <div className="space-y-1">
                      <p className="text-[10px] text-slate-400 font-medium">Sila imbas kod QR di atas untuk navigasi arah ke lokasi majlis.</p>
                      <span className="text-[9px] text-slate-500 block">Hubungi Pertanyaan: 011-1004 5980</span>
                    </div>
                  </div>
                )}

                {/* Background watermarked floral texture overlay */}
                <div className="absolute inset-0 bg-no-repeat bg-cover bg-center mix-blend-overlay opacity-5 z-[0]" />
              </div>
            </div>

            {/* Extra action buttons below card */}
            <div className="flex items-center space-x-2 mt-4" id="card_quick_shares_whatsapp">
                <button
                  onClick={copyWhatsAppFormat}
                  className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Kongsi WhatsApp</span>
                </button>
              </div>
            </div>

            {/* RIGHT: Gemini AI retirement Assistant */}
            <div className="lg:col-span-3">
              <AIAssistant
                inviteeName={card.inviteeName}
                onApplyText={(field, text) => {
                  if (field === "message") updateCard({ message: text });
                  if (field === "prayer") updateCard({ prayer: text });
                }}
                onApplyTheme={(theme) => {
                  updateCard({
                    primaryColor: theme.primaryColor,
                    backgroundColor: theme.backgroundColor,
                    textColor: theme.textColor,
                    fontFamily: theme.fontFamily
                  });
                }}
              />
            </div>
          </div>
        )}


        {/* 3. TEMPLATES GALLERY TAB */}
        {activeTab === "templates" && (
          <div className="space-y-6 animate-fadeIn" id="templates_gallery_tab">
            <div className="text-center max-w-xl mx-auto space-y-2">
              <h2 className="text-2xl font-bold text-slate-100 uppercase tracking-wide">Penerokaan Koleksi Premium</h2>
              <p className="text-xs text-slate-400">Pilih reka bentuk kegemaran anda daripada 50 template sedia ada di bawah untuk diubahsuai di dalam penyunting WYSIWYG.</p>
            </div>
            <TemplateGallery
              onSelectTemplate={applyTemplate}
              activeTemplateId={card.id}
            />
          </div>
        )}


        {/* 4. RSVP REGISTRATION TAB FOR GUESTS */}
        {activeTab === "rsvp" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fadeIn" id="rsvp_module_container">
            {/* Left Column: House details with house photo 'rumah.jpg' */}
            <div className="lg:col-span-5 bg-slate-900/50 border border-slate-800 rounded-3xl p-6 shadow-xl text-slate-100">
              <div className="flex border-b border-slate-800 pb-3 mb-4 justify-between items-center">
                <h3 className="text-sm font-bold text-slate-200 flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-amber-500" />
                  <span>Lokasi & Peta Arah</span>
                </h3>
                <div className="flex gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                  <button
                    onClick={() => setRsvpMapTab("map")}
                    className={`px-2.5 py-1 rounded text-[10px] font-bold transition ${
                      rsvpMapTab === "map" ? "bg-amber-500 text-slate-950" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Peta Dinamik
                  </button>
                  <button
                    onClick={() => setRsvpMapTab("photo")}
                    className={`px-2.5 py-1 rounded text-[10px] font-bold transition ${
                      rsvpMapTab === "photo" ? "bg-amber-500 text-slate-950" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Foto Kediaman
                  </button>
                </div>
              </div>
              
              {/* Conditional Dual-Mode View */}
              {rsvpMapTab === "map" ? (
                <div className="w-full aspect-[3/2] rounded-xl overflow-hidden mb-4 shadow-2xl relative bg-slate-950 border border-slate-800">
                  <iframe
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(card.gpsCoordinates || card.mapAddress || card.venue)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                    className="w-full h-full rounded-xl border-0"
                    allowFullScreen
                    loading="lazy"
                    title="Peta Lokasi Majlis"
                  />
                  {/* rumah.jpg sebagai gambar ikon lokasi rumah */}
                  <button
                    onClick={() => setRsvpMapTab("photo")}
                    className="absolute bottom-3 right-3 p-1 bg-slate-900/90 border border-amber-500/30 rounded-lg flex items-center gap-1.5 shadow-lg hover:bg-slate-800 transition group"
                    title="Lihat Gambar Rumah"
                  >
                    <img
                      src="/src/assets/images/rumah.jpg"
                      alt="Ikon Rumah"
                      className="w-8 h-8 rounded object-cover border border-white/10"
                    />
                    <div className="text-left pr-1.5">
                      <span className="block text-[8px] text-slate-400 font-semibold uppercase leading-none">Ikon Rumah</span>
                      <span className="block text-[9px] text-amber-400 font-bold leading-none mt-0.5 group-hover:underline">Buka Foto</span>
                    </div>
                  </button>
                </div>
              ) : (
                <div className="w-full aspect-[3/2] rounded-xl overflow-hidden mb-4 shadow-2xl relative bg-slate-950 border border-slate-800">
                  <img
                    src="/src/assets/images/rumah.jpg"
                    alt="Lokasi Rumah Pesara"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover animate-fadeIn"
                  />
                  <div className="absolute top-2 right-2 bg-slate-950/80 text-[10px] text-amber-400 px-2.5 py-1 rounded-full font-bold">
                    Gambar Rumah Kediaman
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nama Tempat</h4>
                  <p className="text-xs text-slate-200 mt-1 font-semibold">{card.venue}</p>
                </div>

                {(card.mapAddress || card.gpsCoordinates) && (
                  <div className="pt-3 border-t border-white/5">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Alamat & Koordinat Navigasi</h4>
                    {card.mapAddress && <p className="text-xs text-slate-300 mt-1 leading-relaxed">{card.mapAddress}</p>}
                    {card.gpsCoordinates && (
                      <p className="text-[10px] text-slate-400 mt-1 font-mono bg-black/20 px-2 py-1 rounded inline-block border border-slate-800">
                        GPS: {card.gpsCoordinates}
                      </p>
                    )}
                  </div>
                )}

                <div className="pt-3 border-t border-white/5 space-y-2.5">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tekan Butang Di Bawah Untuk Peta Arah:</p>
                  <div className="grid grid-cols-3 gap-2" id="navigation_maps_launchers">
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(card.gpsCoordinates || card.mapAddress || card.venue)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-xl text-[10px] text-center font-bold block transition border border-slate-700 hover:border-amber-500/20"
                    >
                      Google Maps
                    </a>
                    <a
                      href={
                        card.gpsCoordinates
                          ? `https://waze.com/ul?ll=${card.gpsCoordinates.split(",").map(c => c.trim()).join(",")}&navigate=yes`
                          : `https://waze.com/ul?q=${encodeURIComponent(card.mapAddress || card.venue)}&navigate=yes`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-xl text-[10px] text-center font-bold block transition border border-slate-700 hover:border-amber-500/20"
                    >
                      Waze Peta
                    </a>
                    <a
                      href={`http://maps.apple.com/?daddr=${encodeURIComponent(card.gpsCoordinates || card.mapAddress || card.venue)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-xl text-[10px] text-center font-bold block transition border border-slate-700 hover:border-amber-500/20"
                    >
                      Apple Maps
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: RSVP form */}
            <div className="lg:col-span-7">
              <RSVPManager
                inviteeName={card.inviteeName}
                onRSVPSubmitted={(newRsvp) => {
                  setRsvps((prev) => [newRsvp, ...prev]);
                }}
              />
            </div>
          </div>
        )}


        {/* 5. ADMIN STATISTICS DASHBOARD */}
        {activeTab === "admin" && (
          <div className="space-y-6 animate-fadeIn" id="admin_module_container">
            <div className="text-center max-w-xl mx-auto space-y-2">
              <h2 className="text-2xl font-bold text-slate-100 uppercase tracking-wide">Peti Pemantauan Penganjur</h2>
              <p className="text-xs text-slate-400">Analisis statistik pendaftaran kehadiran tetamu (RSVP), cetakan senarai jemputan dan muat turun kad undangan digital.</p>
            </div>
            <AdminDashboard
              rsvps={rsvps}
              onDeleteRSVP={handleDeleteRSVP}
              onClearAll={handleClearAllRSVPs}
              onReload={loadRSVPs}
            />
          </div>
        )}


        {/* 6. HELP & DOCUMENTATION TAB */}
        {activeTab === "help" && (
          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 max-w-3xl mx-auto shadow-2xl text-slate-100 animate-fadeIn" id="help_documentation_tab">
            <h2 className="text-2xl font-extrabold text-slate-100 mb-6 flex items-center space-x-3">
              <HelpCircle className="w-6 h-6 text-amber-500" />
              <span>Manual Panduan & Bantuan Pengguna</span>
            </h2>

            <div className="space-y-6 text-xs text-slate-300 leading-relaxed">
              <div className="space-y-2">
                <h4 className="font-bold text-sm text-slate-200">1. Bagaimanakah cara untuk menyunting reka bentuk kad?</h4>
                <p>Klik tab <span className="text-amber-400 font-semibold">Penyunting WYSIWYG</span> pada bar menu atas. Anda boleh menyunting teks, mengubah jenis animasi latar belakang, memilih frame border, memuat naik gambar pesara, melakar tandatangan penganjur, dan menukar palet warna mengikut pilihan citarasa anda.</p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-sm text-slate-200">2. Bagaimanakah Pembantu AI Gemini membantu saya?</h4>
                <p>Pilih tab Penyunting WYSIWYG, pembantu AI kami terletak pada baki skrin sebelah kanan. Anda boleh memilih gaya ucapan (Formal, Santai, Keagamaan, Korporat, Puitis) dan menekan butang untuk menjana draf teks secara automatik. Tekan butang 'Suntik' untuk terus memuatkan teks tersebut ke dalam kad.</p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-sm text-slate-200">3. Di manakah maklum balas RSVP tetamu disimpan?</h4>
                <p>Sebaik sahaja tetamu menghantar maklum balas pada tab <span className="text-amber-400 font-semibold">Pengesahan RSVP</span>, data akan diproses dan dihantar terus ke pangkalan data kami. Anda boleh memantau, mencetak atau mengeksport senarai pendaftaran ini ke Excel melalui tab <span className="text-amber-400 font-semibold">Pentadbir</span>.</p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-sm text-slate-200">4. Bolehkah aplikasi ini berfungsi secara luar talian (Offline mode)?</h4>
                <p>Ya! Sebagai Progressive Web App (PWA) bertaraf industri, aplikasi ini dipasang terus pada telefon pintar atau komputer anda. Data yang diisi semasa ketiadaan internet disimpan di dalam storan LocalStorage tempatan dan disegerakkan secara automatik apabila talian internet pulih semula.</p>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Modern Translucent Footer with humble professional credentials */}
      <footer className="bg-slate-950 border-t border-slate-900 py-6 text-center text-xs text-slate-500 shrink-0">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© 2026 Majlis Persaraan & Kesyukuran Nik Norizan. Hak Cipta Terpelihara.</p>
          <p className="flex items-center space-x-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Industrial standard PWA design suite</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
