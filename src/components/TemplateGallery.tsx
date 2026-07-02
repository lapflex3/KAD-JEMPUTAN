import React, { useState, useEffect } from "react";
import { Search, SlidersHorizontal, Heart, Copy, Trash, Check, Sparkles } from "lucide-react";
import { CardTemplate, TemplateCategory } from "../types";
import { PREMIUM_TEMPLATES, TEMPLATE_CATEGORIES } from "../templates";

interface TemplateGalleryProps {
  onSelectTemplate: (template: CardTemplate) => void;
  activeTemplateId?: string;
}

export default function TemplateGallery({ onSelectTemplate, activeTemplateId }: TemplateGalleryProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Semua");
  const [sortOrder, setSortOrder] = useState<"name-asc" | "name-desc" | "default">("default");
  const [templates, setTemplates] = useState<CardTemplate[]>(PREMIUM_TEMPLATES);
  const [favorites, setFavorites] = useState<string[]>([]);

  // Load favorites from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("template_favorites");
    if (saved) {
      try {
        setFavorites(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Save favorites to localStorage
  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    let updated;
    if (favorites.includes(id)) {
      updated = favorites.filter((favId) => favId !== id);
    } else {
      updated = [...favorites, id];
    }
    setFavorites(updated);
    localStorage.setItem("template_favorites", JSON.stringify(updated));
  };

  // Duplicate custom template
  const duplicateTemplate = (template: CardTemplate, e: React.MouseEvent) => {
    e.stopPropagation();
    const newTemplate: CardTemplate = {
      ...template,
      id: `${template.id}-salinan-${Date.now()}`,
      name: `${template.name} (Salinan)`,
    };
    const updated = [...templates, newTemplate];
    setTemplates(updated);
    // Persist custom templates in localStorage if they are custom
    const customs = updated.filter(t => t.id.includes("-salinan-"));
    localStorage.setItem("custom_templates", JSON.stringify(customs));
  };

  // Delete custom template
  const deleteTemplate = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!id.includes("-salinan-")) return; // Only allow deleting duplicates
    const updated = templates.filter((t) => t.id !== id);
    setTemplates(updated);
    const customs = updated.filter(t => t.id.includes("-salinan-"));
    localStorage.setItem("custom_templates", JSON.stringify(customs));
  };

  // Load custom templates on mount
  useEffect(() => {
    const savedCustoms = localStorage.getItem("custom_templates");
    if (savedCustoms) {
      try {
        const parsed = JSON.parse(savedCustoms);
        setTemplates([...PREMIUM_TEMPLATES, ...parsed]);
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Filter and Sort
  const filteredTemplates = templates
    .filter((t) => {
      const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            t.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "Semua" || t.category === selectedCategory || 
                             (selectedCategory === "Kegemaran" && favorites.includes(t.id));
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortOrder === "name-asc") return a.name.localeCompare(b.name);
      if (sortOrder === "name-desc") return b.name.localeCompare(a.name);
      return 0; // Default sort order
    });

  return (
    <div className="space-y-6" id="template_gallery_container">
      {/* Search and Filters */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-5 shadow-lg">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          {/* Search */}
          <div className="relative w-full md:flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari template (cth: Songket, Kubah, Pastel)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 focus:border-amber-500 rounded-xl text-sm text-slate-100 placeholder-slate-400 focus:outline-none transition"
              id="template_search_input"
            />
          </div>

          {/* Sort Order dropdown */}
          <div className="flex items-center space-x-3 w-full md:w-auto">
            <SlidersHorizontal className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={sortOrder}
              onChange={(e: any) => setSortOrder(e.target.value)}
              className="w-full md:w-auto px-3 py-2 bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-xl focus:outline-none focus:border-amber-500 transition"
              id="template_sort_select"
            >
              <option value="default">Susunan Lalai</option>
              <option value="name-asc">Nama (A-Z)</option>
              <option value="name-desc">Nama (Z-A)</option>
            </select>
          </div>
        </div>

        {/* Categories Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto mt-4 pb-2 scrollbar-none" id="categories_tabs">
          <button
            onClick={() => setSelectedCategory("Semua")}
            className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${
              selectedCategory === "Semua"
                ? "bg-amber-500 text-slate-950 font-semibold"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            Semua Template
          </button>
          <button
            onClick={() => setSelectedCategory("Kegemaran")}
            className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap flex items-center space-x-1.5 transition ${
              selectedCategory === "Kegemaran"
                ? "bg-pink-500 text-white font-semibold"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            <Heart className="w-3.5 h-3.5 fill-current" />
            <span>Kegemaran ({favorites.length})</span>
          </button>
          {TEMPLATE_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${
                selectedCategory === cat
                  ? "bg-amber-500 text-slate-950 font-semibold"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Display */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" id="templates_grid">
        {filteredTemplates.map((t) => {
          const isFavorite = favorites.includes(t.id);
          const isActive = activeTemplateId === t.id;
          const isDuplicate = t.id.includes("-salinan-");

          return (
            <div
              key={t.id}
              onClick={() => onSelectTemplate(t)}
              className={`group relative overflow-hidden bg-slate-950 rounded-2xl border transition duration-300 cursor-pointer flex flex-col justify-between ${
                isActive
                  ? "border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.25)] ring-1 ring-amber-500"
                  : "border-slate-800 hover:border-slate-600 hover:shadow-lg"
              }`}
              id={`template_card_${t.id}`}
            >
              {/* Card visual mock preview representing background and borders */}
              <div
                className="aspect-[4/5] w-full p-4 relative flex flex-col justify-between"
                style={{ background: t.backgroundColor }}
              >
                {/* Visual border indicators */}
                {t.borderStyle !== "none" && (
                  <div
                    className="absolute inset-2 pointer-events-none rounded-xl"
                    style={{
                      border: `2px ${t.borderStyle} ${t.primaryColor}`,
                      opacity: 0.6
                    }}
                  />
                )}

                {/* Top header decoration inside card */}
                <div className="flex justify-between items-start z-[2]">
                  <span
                    className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider"
                    style={{ backgroundColor: `${t.primaryColor}20`, color: t.primaryColor }}
                  >
                    {t.category}
                  </span>
                  
                  {/* Heart and Copy Action Toggles */}
                  <div className="flex items-center space-x-1.5 opacity-90 sm:opacity-0 group-hover:opacity-100 transition duration-300">
                    <button
                      onClick={(e) => toggleFavorite(t.id, e)}
                      className="p-1.5 bg-slate-900/80 hover:bg-slate-900 text-pink-500 rounded-lg backdrop-blur-sm transition"
                      title="Suka"
                    >
                      <Heart className={`w-3.5 h-3.5 ${isFavorite ? "fill-pink-500" : ""}`} />
                    </button>
                    <button
                      onClick={(e) => duplicateTemplate(t, e)}
                      className="p-1.5 bg-slate-900/80 hover:bg-slate-900 text-slate-300 rounded-lg backdrop-blur-sm transition"
                      title="Pendua"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    {isDuplicate && (
                      <button
                        onClick={(e) => deleteTemplate(t.id, e)}
                        className="p-1.5 bg-slate-900/80 hover:bg-red-900 text-red-400 rounded-lg backdrop-blur-sm transition"
                        title="Padam"
                      >
                        <Trash className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Simulated center text */}
                <div className="text-center my-auto px-4 z-[2]">
                  <p
                    className="text-[10px] uppercase tracking-widest font-semibold"
                    style={{ color: t.primaryColor }}
                  >
                    Persaraan & Kesyukuran
                  </p>
                  <h4
                    className="text-lg font-bold leading-tight mt-1 truncate"
                    style={{ color: t.textColor, fontFamily: t.fontFamily }}
                  >
                    {t.name}
                  </h4>
                  <div
                    className="w-10 h-0.5 mx-auto mt-2"
                    style={{ backgroundColor: t.primaryColor }}
                  />
                </div>

                {/* Base color indicator swatches */}
                <div className="flex items-center space-x-1 z-[2] mt-auto">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: t.primaryColor }} title="Utama" />
                  <span className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: t.accentColor }} title="Aksen" />
                  <span className="w-3 h-3 rounded-full border border-white/10" style={{ backgroundColor: t.secondaryColor }} title="Sekunder" />
                </div>

                {/* Selected Indicator */}
                {isActive && (
                  <div className="absolute top-2 right-2 bg-amber-500 text-slate-950 p-1.5 rounded-full z-10 shadow-md">
                    <Check className="w-3.5 h-3.5 stroke-[3px]" />
                  </div>
                )}
              </div>

              {/* Card Footer Text */}
              <div className="p-3 bg-slate-900 border-t border-slate-800 flex justify-between items-center text-xs">
                <span className="text-slate-300 font-medium truncate max-w-[150px]">{t.name}</span>
                <span className="text-slate-500 text-[10px] flex items-center space-x-1">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>Premium</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-16 bg-slate-900/50 rounded-3xl border border-slate-800">
          <p className="text-slate-400 text-sm">Tiada template ditemui padan dengan kriteria carian anda.</p>
          <button
            onClick={() => { setSearchTerm(""); setSelectedCategory("Semua"); }}
            className="mt-3 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-semibold rounded-xl transition"
          >
            Set Semula Penapis
          </button>
        </div>
      )}
    </div>
  );
}
