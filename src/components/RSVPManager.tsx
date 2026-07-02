import React, { useState } from "react";
import { Check, X, Users, MessageSquare, Phone, Send, Smile, Info } from "lucide-react";

interface RSVPManagerProps {
  onRSVPSubmitted?: (newRsvp: any) => void;
  inviteeName?: string;
}

export default function RSVPManager({ onRSVPSubmitted, inviteeName = "Nik Norizan" }: RSVPManagerProps) {
  const [name, setName] = useState("");
  const [attendance, setAttendance] = useState<boolean | null>(null);
  const [guests, setGuests] = useState("1");
  const [wish, setWish] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg("Sila isi nama penuh anda.");
      return;
    }
    if (attendance === null) {
      setErrorMsg("Sila nyatakan status kehadiran anda.");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");

    const payload = {
      name,
      attendance,
      guests: attendance ? Number(guests) : 0,
      wish,
      phone
    };

    try {
      // Direct integration with our real server endpoint
      const response = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (data.success) {
        setSubmitted(true);
        if (onRSVPSubmitted) {
          onRSVPSubmitted(data.data);
        }
        
        // Save to LocalStorage as a user's RSVP history
        localStorage.setItem("my_submitted_rsvp", JSON.stringify(data.data));
      } else {
        setErrorMsg(data.error || "Gagal menghantar maklum balas RSVP.");
      }
    } catch (err: any) {
      // Offline fallback: save in localStorage and simulate success
      console.warn("Server offline. Menyimpan RSVP secara tempatan (offline mode):", err);
      const simulatedRsvp = {
        id: "offline-" + Date.now(),
        createdAt: new Date().toISOString(),
        ...payload
      };
      
      // Save to local offline queue
      const existingOffline = JSON.parse(localStorage.getItem("offline_rsvps") || "[]");
      existingOffline.push(simulatedRsvp);
      localStorage.setItem("offline_rsvps", JSON.stringify(existingOffline));
      
      setSubmitted(true);
      if (onRSVPSubmitted) {
        onRSVPSubmitted(simulatedRsvp);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-slate-900/50 text-center p-8 rounded-3xl border border-emerald-500/20 max-w-md mx-auto shadow-2xl" id="rsvp_success_panel">
        <div className="w-14 h-14 bg-emerald-500/15 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
          <Check className="w-8 h-8 stroke-[3px]" />
        </div>
        <h3 className="text-xl font-bold text-slate-100">RSVP Berjaya Dihantar!</h3>
        <p className="text-xs text-slate-300 mt-2 leading-relaxed">
          Terima kasih kerana meluangkan masa untuk membuat pengesahan kehadiran. Kehadiran anda amat kami hargai sempena persaraan <span className="text-amber-400 font-semibold">{inviteeName}</span>.
        </p>

        <div className="mt-6 p-4 bg-slate-800/50 rounded-xl border border-white/5 text-left text-xs text-slate-400">
          <p className="font-semibold text-slate-300 mb-1">Butiran Pengesahan Anda:</p>
          <p>• Nama: <span className="text-slate-200">{name}</span></p>
          <p>• Status: <span className={attendance ? "text-emerald-400 font-semibold" : "text-red-400 font-semibold"}>{attendance ? "Hadir" : "Tidak Hadir"}</span></p>
          {attendance && <p>• Jumlah Tetamu: <span className="text-slate-200">{guests} orang</span></p>}
          {wish && <p className="italic mt-2 bg-black/20 p-2 rounded">" {wish} "</p>}
        </div>

        <button
          onClick={() => { setSubmitted(false); setName(""); setAttendance(null); setWish(""); setPhone(""); }}
          className="mt-6 px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold text-xs rounded-xl transition"
        >
          Hantar RSVP Lain
        </button>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 shadow-xl text-slate-100 max-w-lg mx-auto" id="rsvp_form_container">
      <div className="text-center mb-6">
        <h3 className="text-lg font-bold text-slate-100 uppercase tracking-wide">Pengesahan Kehadiran (RSVP)</h3>
        <p className="text-xs text-slate-400 mt-1">Sila lengkapkan borang pengesahan kehadiran di bawah</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl flex items-center space-x-2">
            <Info className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Guest Name */}
        <div className="space-y-1">
          <label className="text-xs text-slate-300 font-medium">Nama Penuh Tetamu</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="cth: Dato' Aminul Rashid"
            className="w-full px-4 py-2 bg-slate-800/80 border border-slate-700 focus:border-amber-500 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none transition"
            id="rsvp_guest_name"
          />
        </div>

        {/* Attendance Status Selector */}
        <div className="space-y-2">
          <label className="text-xs text-slate-300 font-medium block">Status Kehadiran</label>
          <div className="grid grid-cols-2 gap-3" id="rsvp_attendance_toggles">
            <button
              type="button"
              onClick={() => setAttendance(true)}
              className={`flex items-center justify-center space-x-2 py-2.5 rounded-xl text-xs font-semibold border transition ${
                attendance === true
                  ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                  : "bg-slate-800/50 text-slate-400 border-transparent hover:bg-slate-800"
              }`}
            >
              <Check className="w-4 h-4" />
              <span>Hadir (Will Attend)</span>
            </button>
            <button
              type="button"
              onClick={() => { setAttendance(false); setGuests("0"); }}
              className={`flex items-center justify-center space-x-2 py-2.5 rounded-xl text-xs font-semibold border transition ${
                attendance === false
                  ? "bg-red-500/20 text-red-400 border-red-500/40"
                  : "bg-slate-800/50 text-slate-400 border-transparent hover:bg-slate-800"
              }`}
            >
              <X className="w-4 h-4" />
              <span>Tidak Hadir (Decline)</span>
            </button>
          </div>
        </div>

        {/* Accompanying guests selector (only shown if attending) */}
        {attendance === true && (
          <div className="space-y-1 animate-fadeIn">
            <label className="text-xs text-slate-300 font-medium flex items-center space-x-1.5">
              <Users className="w-4 h-4 text-slate-400" />
              <span>Bilangan Tetamu (Termasuk Anda)</span>
            </label>
            <select
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 focus:border-amber-500 rounded-xl text-xs text-slate-200 focus:outline-none transition"
              id="rsvp_guests_count_select"
            >
              <option value="1">1 Orang (Hanya Saya)</option>
              <option value="2">2 Orang</option>
              <option value="3">3 Orang</option>
              <option value="4">4 Orang</option>
              <option value="5">5 Orang (Maksimum Seisi Keluarga)</option>
            </select>
          </div>
        )}

        {/* Contact Phone */}
        <div className="space-y-1">
          <label className="text-xs text-slate-300 font-medium flex items-center space-x-1.5">
            <Phone className="w-4 h-4 text-slate-400" />
            <span>Nombor Telefon Hubungi (Pilihan)</span>
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="cth: 011-1004 5980"
            className="w-full px-4 py-2 bg-slate-800/80 border border-slate-700 focus:border-amber-500 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none transition"
            id="rsvp_guest_phone"
          />
        </div>

        {/* Wish / Message Box */}
        <div className="space-y-1">
          <label className="text-xs text-slate-300 font-medium flex items-center space-x-1.5">
            <MessageSquare className="w-4 h-4 text-slate-400" />
            <span>Ucapan & Doa Buat Pesara (Pilihan)</span>
          </label>
          <textarea
            value={wish}
            onChange={(e) => setWish(e.target.value)}
            placeholder="cth: Selamat bersara guruku tercinta! Jasa bakti cikgu mendidik kami tidak akan dilupakan..."
            className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 focus:border-amber-500 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition min-h-[80px]"
            id="rsvp_guest_wish_textarea"
          />
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full flex items-center justify-center space-x-2 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl transition shadow-lg disabled:opacity-50"
          id="btn_submit_rsvp"
        >
          {submitting ? "Menghantar..." : (
            <>
              <Send className="w-4 h-4" />
              <span>Hantar Pengesahan Kehadiran</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
