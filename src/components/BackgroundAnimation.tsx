import React, { useEffect, useState } from "react";

interface Particle {
  id: number;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  size: number;
  color: string;
  delay: number; // seconds
  duration: number; // seconds
  emoji?: string;
  shapeClass?: string;
}

interface BackgroundAnimationProps {
  type: string; // "none" | "snow" | "flower" | "sparkle" | "firefly" | "confetti" | "golden" | "bubble"
}

export default function BackgroundAnimation({ type }: BackgroundAnimationProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (type === "none") {
      setParticles([]);
      return;
    }

    const count = type === "sparkle" || type === "golden" ? 40 : 25;
    const generated: Particle[] = [];

    const getEmojiForType = (t: string) => {
      if (t === "flower") {
        const petals = ["🌸", "🌹", "🌷", "🌺", "🍃"];
        return petals[Math.floor(Math.random() * petals.length)];
      }
      if (t === "snow") return "❄️";
      if (t === "sparkle") return "✨";
      if (t === "bubble") return "🫧";
      return undefined;
    };

    const getShapeForType = (t: string) => {
      if (t === "confetti") {
        const colors = [
          "bg-red-400", "bg-blue-400", "bg-yellow-400", "bg-green-400", 
          "bg-pink-400", "bg-purple-400", "bg-orange-400"
        ];
        return `${colors[Math.floor(Math.random() * colors.length)]} rounded-sm`;
      }
      if (t === "golden") {
        return "bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 rounded-full shadow-[0_0_8px_#f59e0b]";
      }
      if (t === "firefly") {
        return "bg-yellow-200 rounded-full shadow-[0_0_10px_#fef08a] opacity-80 animate-pulse";
      }
      return "";
    };

    for (let i = 0; i < count; i++) {
      generated.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100 + 100, // Start below viewport
        size: Math.random() * (type === "flower" || type === "bubble" ? 18 : 6) + 6,
        color: type === "golden" ? "#DFBA54" : type === "firefly" ? "#FEF08A" : "#FFFFFF",
        delay: Math.random() * 10,
        duration: Math.random() * 12 + 8, // 8s to 20s
        emoji: getEmojiForType(type),
        shapeClass: getShapeForType(type)
      });
    }

    setParticles(generated);
  }, [type]);

  if (type === "none") return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-[1]">
      {particles.map((p) => {
        if (p.emoji) {
          return (
            <div
              key={p.id}
              className="absolute text-center select-none animate-float opacity-0"
              style={{
                left: `${p.x}%`,
                fontSize: `${p.size}px`,
                animationDelay: `${p.delay}s`,
                animationDuration: `${p.duration}s`,
                bottom: "-5%",
              }}
            >
              {p.emoji}
            </div>
          );
        }

        return (
          <div
            key={p.id}
            className={`absolute animate-float opacity-0 ${p.shapeClass}`}
            style={{
              left: `${p.x}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
              bottom: "-5%",
            }}
          />
        );
      })}
    </div>
  );
}
