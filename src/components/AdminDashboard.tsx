import React, { useState, useEffect } from "react";
import { Download, RefreshCw, Trash2, Users, CheckCircle, XCircle, Share2, Printer, Search, FileDown } from "lucide-react";
import { RSVP } from "../types";

interface AdminDashboardProps {
  rsvps: RSVP[];
  onDeleteRSVP: (id: string) => void;
  onClearAll: () => void;
  onReload: () => void;
}

export default function AdminDashboard({ rsvps, onDeleteRSVP, onClearAll, onReload }: AdminDashboardProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "attending" | "declined">("all");
  const [stats, setStats] = useState({
    cards: 1,
    downloads: 142,
    shares: 310
  });

  // Calculate statistics from RSVPs list
  const totalRsvps = rsvps.length;
  const attendingRsvps = rsvps.filter((r) => r.attendance);
  const totalGuests = attendingRsvps.reduce((acc, curr) => acc + (curr.guests || 1), 0);
  const declinedRsvps = rsvps.filter((r) => !r.attendance);

  // Filter list based on search and selected filterType
  const filteredRsvps = rsvps.filter((r) => {
    const matchesSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (r.wish && r.wish.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = filterType === "all" || 
                         (filterType === "attending" && r.attendance) || 
                         (filterType === "declined" && !r.attendance);
    return matchesSearch && matchesFilter;
  });

  // Export RSVP to CSV
  const exportToCSV = () => {
    if (rsvps.length === 0) {
      alert("Tiada data RSVP untuk dieksport.");
      return;
    }

    const headers = ["ID", "Nama", "Kehadiran", "Jumlah Tetamu", "Ucapan", "No Telefon", "Tarikh"];
    const rows = rsvps.map((r) => [
      r.id,
      `"${r.name.replace(/"/g, '""')}"`,
      r.attendance ? "Hadir" : "Tidak Hadir",
      r.attendance ? r.guests : 0,
      r.wish ? `"${r.wish.replace(/"/g, '""')}"` : "",
      r.phone || "",
      r.createdAt
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Laporan_RSVP_Majlis_Persaraan.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print list
  const handlePrint = () => {
    window.print();
  };

  // Generate demo data helper
  const seedDemoData = () => {
    const names = [
      "Dato' Sri Idris Haron", "Prof. Dr. Fatimah Salleh", "Ir. Ahmad Shazli", "Puan Hajah Aminah",
      "Encik Khairul Nizam", "Cik Syarifah Nur", "Dr. Tan Kai Sheng", "Encik Muthu Samy",
      "Puan Zarina Wahab", "Datin Rozita Awang"
    ];
    const wishes = [
      "Selamat bersara cikgu! Jasa cikgu mengajar kami subjek matematik tidak akan dilupakan.",
      "Jasamu dikenang cikgu! Semoga sihat walafiat selalu di samping keluarga tercinta.",
      "Selamat beristirahat daripada tugas rasmi, moga dipermudahkan urusan kehidupan fasa baharu.",
      "Tahniah atas persaraan yang penuh kejayaan. Terima kasih atas kepimpinan cemerlang cikgu.",
      "Moga Allah merahmati fasa persaraan puan sekeluarga dengan sakinah dan mawaddah. Amin."
    ];

    names.forEach(async (name, index) => {
      const attendance = Math.random() > 0.2; // 80% attending
      const payload = {
        name,
        attendance,
        guests: attendance ? Math.floor(Math.random() * 4) + 1 : 0,
        wish: Math.random() > 0.3 ? wishes[index % wishes.length] : "",
        phone: `01${Math.floor(Math.random() * 90000000) + 10000000}`
      };

      try {
        await fetch("/api/rsvp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      } catch (e) {
        console.error(e);
      }
    });

    setTimeout(() => {
      onReload();
    }, 1000);
  };

  return (
    <div className="space-y-6" id="admin_dashboard_container">
      {/* Top statistics indicators */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Metric 1 */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-4 flex items-center space-x-3 shadow-lg">
          <div className="p-3 bg-blue-500/15 text-blue-400 rounded-xl">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-semibold">Jumlah RSVP</p>
            <h3 className="text-xl font-bold text-slate-100">{totalRsvps}</h3>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-4 flex items-center space-x-3 shadow-lg">
          <div className="p-3 bg-emerald-500/15 text-emerald-400 rounded-xl">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-semibold">Tetamu Hadir</p>
            <h3 className="text-xl font-bold text-slate-100">{totalGuests} <span className="text-xs text-slate-400 font-normal">orang</span></h3>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-4 flex items-center space-x-3 shadow-lg">
          <div className="p-3 bg-red-500/15 text-red-400 rounded-xl">
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-semibold">Tidak Hadir</p>
            <h3 className="text-xl font-bold text-slate-100">{declinedRsvps.length}</h3>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-4 flex items-center space-x-3 shadow-lg">
          <div className="p-3 bg-amber-500/15 text-amber-400 rounded-xl">
            <Download className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-semibold">Muat Turun</p>
            <h3 className="text-xl font-bold text-slate-100">{stats.downloads}</h3>
          </div>
        </div>

        {/* Metric 5 */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-4 flex items-center space-x-3 shadow-lg text-slate-100">
          <div className="p-3 bg-purple-500/15 text-purple-400 rounded-xl">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-semibold">Perkongsian</p>
            <h3 className="text-xl font-bold text-slate-100">{stats.shares}</h3>
          </div>
        </div>
      </div>

      {/* Graphs & Charts Panel using responsive SVG vector graphic representation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* RSVP Distribution SVG Chart */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-5 shadow-lg lg:col-span-2">
          <h4 className="text-sm font-semibold text-slate-200 mb-4 uppercase tracking-wider">Graf Pengesahan Kehadiran</h4>
          
          <div className="h-48 w-full flex items-center justify-center bg-black/20 rounded-xl p-3" id="svg_chart_container">
            {totalRsvps === 0 ? (
              <p className="text-slate-500 text-xs italic">Tiada data RSVP untuk dilakarkan. Tambah maklumat tetamu dahulu.</p>
            ) : (
              <svg viewBox="0 0 400 200" className="w-full h-full">
                {/* Horizontal grid lines */}
                <line x1="40" y1="20" x2="380" y2="20" stroke="#334155" strokeWidth="1" strokeDasharray="4" />
                <line x1="40" y1="70" x2="380" y2="70" stroke="#334155" strokeWidth="1" strokeDasharray="4" />
                <line x1="40" y1="120" x2="380" y2="120" stroke="#334155" strokeWidth="1" strokeDasharray="4" />
                <line x1="40" y1="170" x2="380" y2="170" stroke="#334155" strokeWidth="2" />

                {/* Vertical axis line */}
                <line x1="40" y1="20" x2="40" y2="170" stroke="#475569" strokeWidth="2" />

                {/* Y-Axis Labels */}
                <text x="15" y="24" fill="#94a3b8" fontSize="10" fontWeight="bold">100%</text>
                <text x="15" y="74" fill="#94a3b8" fontSize="10" fontWeight="bold">50%</text>
                <text x="15" y="124" fill="#94a3b8" fontSize="10" fontWeight="bold">25%</text>
                <text x="20" y="174" fill="#94a3b8" fontSize="10" fontWeight="bold">0</text>

                {/* Attending Bar - Green */}
                {(() => {
                  const attendingPct = totalRsvps > 0 ? (attendingRsvps.length / totalRsvps) * 150 : 0;
                  return (
                    <>
                      <rect
                        x="100"
                        y={170 - attendingPct}
                        width="60"
                        height={attendingPct}
                        fill="url(#green_gradient)"
                        rx="4"
                        className="transition-all duration-500"
                      />
                      <text x="130" y={150 - attendingPct} fill="#34d399" fontSize="11" fontWeight="bold" textAnchor="middle">
                        {attendingRsvps.length} ({Math.round((attendingRsvps.length / totalRsvps) * 100)}%)
                      </text>
                      <text x="130" y="185" fill="#94a3b8" fontSize="10" fontWeight="medium" textAnchor="middle">Hadir</text>
                    </>
                  );
                })()}

                {/* Declined Bar - Red */}
                {(() => {
                  const declinedPct = totalRsvps > 0 ? (declinedRsvps.length / totalRsvps) * 150 : 0;
                  return (
                    <>
                      <rect
                        x="240"
                        y={170 - declinedPct}
                        width="60"
                        height={declinedPct}
                        fill="url(#red_gradient)"
                        rx="4"
                        className="transition-all duration-500"
                      />
                      <text x="270" y={150 - declinedPct} fill="#f87171" fontSize="11" fontWeight="bold" textAnchor="middle">
                        {declinedRsvps.length} ({Math.round((declinedRsvps.length / totalRsvps) * 100)}%)
                      </text>
                      <text x="270" y="185" fill="#94a3b8" fontSize="10" fontWeight="medium" textAnchor="middle">Tidak Hadir</text>
                    </>
                  );
                })()}

                {/* Definitions for Gradients */}
                <defs>
                  <linearGradient id="green_gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#047857" />
                  </linearGradient>
                  <linearGradient id="red_gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ef4444" />
                    <stop offset="100%" stopColor="#b91c1c" />
                  </linearGradient>
                </defs>
              </svg>
            )}
          </div>
        </div>

        {/* Action Controls & Utilities Panel */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-semibold text-slate-200 mb-3 uppercase tracking-wider">Utiliti & Alat Pengurusan</h4>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">Urus data, cetak senarai tetamu lengkap atau eksport ke fail CSV untuk penganjuran yang tersusun.</p>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={exportToCSV}
              className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-xl border border-slate-700 transition"
              id="btn_export_csv"
            >
              <span className="flex items-center space-x-2">
                <FileDown className="w-4 h-4 text-amber-400" />
                <span>Eksport Excel/CSV</span>
              </span>
              <span className="text-[10px] bg-slate-700/60 text-slate-400 px-1.5 py-0.5 rounded">CSV</span>
            </button>

            <button
              onClick={handlePrint}
              className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-xl border border-slate-700 transition"
              id="btn_print_list"
            >
              <span className="flex items-center space-x-2">
                <Printer className="w-4 h-4 text-blue-400" />
                <span>Cetak Senarai Kehadiran</span>
              </span>
              <span className="text-[10px] bg-slate-700/60 text-slate-400 px-1.5 py-0.5 rounded">PDF</span>
            </button>

            <button
              onClick={seedDemoData}
              className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-xl border border-slate-700 transition"
              id="btn_seed_mock_rsvps"
            >
              <span className="flex items-center space-x-2">
                <RefreshCw className="w-4 h-4 text-emerald-400" />
                <span>AI Janakan 10 RSVP Contoh</span>
              </span>
              <span className="text-[10px] bg-slate-700/60 text-slate-400 px-1.5 py-0.5 rounded">Demo</span>
            </button>

            <button
              onClick={() => { if (confirm("Padam semua RSVP? Tindakan ini tidak boleh diundurkan.")) onClearAll(); }}
              className="w-full flex items-center justify-between px-4 py-2.5 bg-red-950/40 hover:bg-red-950/60 text-red-400 text-xs rounded-xl border border-red-900/30 transition"
              id="btn_clear_all_rsvps"
            >
              <span className="flex items-center space-x-2">
                <Trash2 className="w-4 h-4 text-red-500" />
                <span className="font-semibold">Kosongkan Semua RSVP</span>
              </span>
              <span className="text-[10px] bg-red-900/50 text-red-300 px-1.5 py-0.5 rounded">Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* Guest Listing Table Panel */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-3xl shadow-lg overflow-hidden">
        {/* Table header tools */}
        <div className="p-5 border-b border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between">
          <h4 className="text-sm font-semibold text-slate-200 uppercase tracking-wider shrink-0">Senarai Pengesahan Kehadiran Tetamu</h4>
          
          {/* Search Table */}
          <div className="relative w-full md:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Cari tetamu atau ucapan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 focus:border-amber-500 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none transition"
              id="rsvp_search_table_input"
            />
          </div>

          {/* Filtering Toggles */}
          <div className="flex space-x-2 w-full md:w-auto overflow-x-auto scrollbar-none" id="table_filter_tabs">
            <button
              onClick={() => setFilterType("all")}
              className={`px-3 py-1.5 rounded-lg text-xs transition whitespace-nowrap ${
                filterType === "all" ? "bg-amber-500 text-slate-950 font-bold" : "bg-slate-800 text-slate-400 hover:bg-slate-700"
              }`}
            >
              Semua ({totalRsvps})
            </button>
            <button
              onClick={() => setFilterType("attending")}
              className={`px-3 py-1.5 rounded-lg text-xs transition whitespace-nowrap ${
                filterType === "attending" ? "bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30" : "bg-slate-800 text-slate-400 hover:bg-slate-700"
              }`}
            >
              Hadir ({totalGuests})
            </button>
            <button
              onClick={() => setFilterType("declined")}
              className={`px-3 py-1.5 rounded-lg text-xs transition whitespace-nowrap ${
                filterType === "declined" ? "bg-red-500/20 text-red-400 font-bold border border-red-500/30" : "bg-slate-800 text-slate-400 hover:bg-slate-700"
              }`}
            >
              Tidak Hadir ({declinedRsvps.length})
            </button>
          </div>
        </div>

        {/* Interactive Responsive Table view */}
        <div className="overflow-x-auto" id="rsvp_table_wrapper">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950/40 text-slate-400 border-b border-slate-800/60 uppercase tracking-wider text-[10px] font-semibold">
                <th className="p-4">Nama Tetamu</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Bil. Tetamu</th>
                <th className="p-4">Ucapan Buat Pesara</th>
                <th className="p-4">No Telefon</th>
                <th className="p-4">Tarikh Daftar</th>
                <th className="p-4 text-center">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {filteredRsvps.map((r) => (
                <tr key={r.id} className="hover:bg-white/5 text-slate-200 transition" id={`rsvp_row_${r.id}`}>
                  <td className="p-4 font-semibold text-slate-100">{r.name}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold inline-flex items-center space-x-1 ${
                      r.attendance 
                        ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20" 
                        : "bg-red-500/15 text-red-400 border border-red-500/20"
                    }`}>
                      {r.attendance ? (
                        <>
                          <CheckCircle className="w-3 h-3 shrink-0" />
                          <span>Hadir</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3 shrink-0" />
                          <span>Tidak Hadir</span>
                        </>
                      )}
                    </span>
                  </td>
                  <td className="p-4 text-center font-bold text-slate-300">{r.attendance ? r.guests : 0}</td>
                  <td className="p-4 max-w-xs truncate italic text-slate-400" title={r.wish || "Tiada"}>
                    {r.wish ? `"${r.wish}"` : "-"}
                  </td>
                  <td className="p-4 text-slate-300 font-mono">{r.phone || "-"}</td>
                  <td className="p-4 text-slate-400 text-[10px]">{new Date(r.createdAt).toLocaleString("ms-MY")}</td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => { if (confirm(`Padam RSVP untuk ${r.name}?`)) onDeleteRSVP(r.id); }}
                      className="p-1.5 bg-red-500/10 hover:bg-red-500 hover:text-white text-red-400 rounded-lg transition"
                      title="Padam"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredRsvps.length === 0 && (
          <div className="text-center py-12 text-slate-500 italic">
            Tiada rekod pengesahan kehadiran ditemui.
          </div>
        )}
      </div>
    </div>
  );
}
