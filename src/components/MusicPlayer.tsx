import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, Volume2, VolumeX, Music, Upload, Check } from "lucide-react";

interface Track {
  id: string;
  name: string;
  url: string;
  category: string;
}

const BUILTIN_TRACKS: Track[] = [
  {
    id: "gamelan-youtube",
    name: "Gamelan Warisan Melayu (Lagu Tema Utama)",
    url: "https://youtu.be/FL02h4nRfvw?si=BA1TjxRrYBySJxQc",
    category: "YouTube Latar"
  },
  {
    id: "gamelan",
    name: "Tradisional Melayu (Gamelan & Saluang)",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    category: "Tradisional Melayu"
  },
  {
    id: "nasyid",
    name: "Nasyid Zikir Kedamaian (Soft Instrumental)",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    category: "Nasyid"
  },
  {
    id: "piano",
    name: "Sentuhan Syahdu Piano",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    category: "Piano"
  },
  {
    id: "orchestra",
    name: "Orkestra Persaraan Jasamu Dikenang",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    category: "Orchestra"
  },
  {
    id: "instrumental",
    name: "Biola Teduh (Instrumental)",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
    category: "Instrumental"
  }
];

interface MusicPlayerProps {
  currentMusicUrl?: string;
  currentMusicName?: string;
  onMusicChange: (url: string, name: string) => void;
}

export function getYouTubeId(url: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

export default function MusicPlayer({ currentMusicUrl, currentMusicName, onMusicChange }: MusicPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [tracks, setTracks] = useState<Track[]>(BUILTIN_TRACKS);
  const [selectedTrackId, setSelectedTrackId] = useState<string>("gamelan-youtube");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    // Sync selected track ID with prop url
    if (currentMusicUrl) {
      const match = tracks.find((t) => t.url === currentMusicUrl);
      if (match) {
        setSelectedTrackId(match.id);
      } else {
        setSelectedTrackId("custom");
      }
    }
  }, [currentMusicUrl, tracks]);

  useEffect(() => {
    // Re-initialize audio object when url changes
    if (audioRef.current) {
      audioRef.current.pause();
    }

    const isYouTube = currentMusicUrl && (currentMusicUrl.includes("youtu.be") || currentMusicUrl.includes("youtube.com"));

    if (isYouTube) {
      audioRef.current = null;
      return;
    }

    const playUrl = currentMusicUrl || BUILTIN_TRACKS[1].url;
    audioRef.current = new Audio(playUrl);
    audioRef.current.loop = true;
    audioRef.current.volume = isMuted ? 0 : volume;

    if (isPlaying) {
      audioRef.current.play().catch((e) => {
        console.log("Autoplay was blocked or interrupted:", e);
        setIsPlaying(false);
      });
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [currentMusicUrl]);

  const togglePlay = () => {
    const isYouTube = currentMusicUrl && (currentMusicUrl.includes("youtu.be") || currentMusicUrl.includes("youtube.com"));

    if (isYouTube) {
      setIsPlaying(!isPlaying);
      return;
    }

    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((err) => {
        console.error("Gagal memainkan audio:", err);
      });
    }
  };

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);

    const isYouTube = currentMusicUrl && (currentMusicUrl.includes("youtu.be") || currentMusicUrl.includes("youtube.com"));
    if (!isYouTube && audioRef.current) {
      audioRef.current.volume = nextMuted ? 0 : volume;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    
    const isYouTube = currentMusicUrl && (currentMusicUrl.includes("youtu.be") || currentMusicUrl.includes("youtube.com"));
    if (!isYouTube && audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : val;
    }
    if (val > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const handleTrackSelect = (track: Track) => {
    onMusicChange(track.url, track.name);
    setSelectedTrackId(track.id);
    setIsPlaying(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    const customTrack: Track = {
      id: "custom-" + Date.now(),
      name: `Muzik Anda: ${file.name.replace(/\.[^/.]+$/, "")}`,
      url: url,
      category: "Muat Naik"
    };

    setTracks((prev) => [customTrack, ...prev.filter((t) => !t.id.startsWith("custom-"))]);
    onMusicChange(url, customTrack.name);
    setSelectedTrackId(customTrack.id);
    setIsPlaying(true);
  };

  const ytId = isPlaying ? getYouTubeId(currentMusicUrl || "") : null;

  return (
    <div className="glass-panel-dark rounded-2xl p-6 text-slate-100 shadow-xl border border-white/10" id="music_player_container">
      {/* Hidden YouTube background audio player */}
      {ytId && (
        <iframe
          width="0"
          height="0"
          src={`https://www.youtube.com/embed/${ytId}?autoplay=1&loop=1&playlist=${ytId}&mute=${isMuted ? 1 : 0}`}
          allow="autoplay"
          className="w-0 h-0 opacity-0 pointer-events-none absolute"
          title="YouTube Background Music"
        />
      )}

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 bg-amber-500/20 text-amber-400 rounded-lg ${isPlaying ? 'animate-spin' : ''}`}>
            <Music className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Muzik Latar Belakang</h3>
            <p className="text-xs text-slate-400 truncate max-w-[180px]">
              {currentMusicName || "Tiada muzik dipilih"}
            </p>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleMute}
            className="p-2 hover:bg-white/10 rounded-lg text-slate-300 transition"
            title={isMuted ? "Unmute" : "Mute"}
            id="btn_toggle_mute"
          >
            {isMuted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5 text-slate-300" />}
          </button>
          <button
            onClick={togglePlay}
            className="p-3 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-full transition shadow-lg flex items-center justify-center"
            title={isPlaying ? "Jeda" : "Main"}
            id="btn_toggle_play"
          >
            {isPlaying ? <Pause className="w-5 h-5 fill-slate-950" /> : <Play className="w-5 h-5 fill-slate-950" />}
          </button>
        </div>
      </div>

      {/* Audio Visualizer animation when playing */}
      {isPlaying && (
        <div className="flex items-end justify-center space-x-1 h-6 my-4" id="audio_visualizer">
          <span className="w-1 bg-amber-400 rounded animate-[bounce_0.8s_infinite_100ms]" style={{ height: "40%" }} />
          <span className="w-1 bg-amber-400 rounded animate-[bounce_0.8s_infinite_300ms]" style={{ height: "80%" }} />
          <span className="w-1 bg-amber-400 rounded animate-[bounce_0.8s_infinite_50ms]" style={{ height: "60%" }} />
          <span className="w-1 bg-amber-400 rounded animate-[bounce_0.8s_infinite_200ms]" style={{ height: "90%" }} />
          <span className="w-1 bg-amber-400 rounded animate-[bounce_0.8s_infinite_400ms]" style={{ height: "50%" }} />
          <span className="w-1 bg-amber-400 rounded animate-[bounce_0.8s_infinite_150ms]" style={{ height: "70%" }} />
        </div>
      )}

      {/* Volume Slider */}
      <div className="flex items-center space-x-3 mb-5">
        <VolumeX className="w-4 h-4 text-slate-500" />
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={volume}
          onChange={handleVolumeChange}
          className="w-full accent-amber-500 bg-slate-700 h-1 rounded-lg appearance-none cursor-pointer"
          id="volume_slider_input"
        />
        <Volume2 className="w-4 h-4 text-slate-400" />
      </div>

      {/* Tracks List */}
      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Pilihan Melodi Premium</p>
        {tracks.map((t) => (
          <button
            key={t.id}
            onClick={() => handleTrackSelect(t)}
            className={`w-full flex items-center justify-between p-2.5 rounded-lg text-left text-xs transition ${
              selectedTrackId === t.id
                ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                : "hover:bg-white/5 text-slate-300 border border-transparent"
            }`}
          >
            <div className="flex flex-col">
              <span className="font-medium truncate max-w-[200px]">{t.name}</span>
              <span className="text-[10px] text-slate-500 mt-0.5">{t.category}</span>
            </div>
            {selectedTrackId === t.id && <Check className="w-4 h-4 text-amber-400 shrink-0 ml-2" />}
          </button>
        ))}
      </div>

      {/* File Upload for custom MP3 */}
      <div className="mt-4 pt-4 border-t border-white/5">
        <input
          type="file"
          accept="audio/mp3,audio/*"
          ref={fileInputRef}
          onChange={handleFileUpload}
          className="hidden"
          id="music_file_upload"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full flex items-center justify-center space-x-2 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl border border-dashed border-white/20 text-xs text-slate-300 transition"
          id="btn_upload_music"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Fail MP3 Sendiri</span>
        </button>
      </div>
    </div>
  );
}
