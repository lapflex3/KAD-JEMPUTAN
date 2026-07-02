import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Path to JSON RSVP database
const DATA_DIR = path.join(process.cwd(), "data");
const RSVP_FILE = path.join(DATA_DIR, "rsvps.json");

// Ensure data folder and file exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(RSVP_FILE)) {
  fs.writeFileSync(RSVP_FILE, JSON.stringify([], null, 2));
}

// Function to read RSVPs
function getRSVPs() {
  try {
    const data = fs.readFileSync(RSVP_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading RSVP file:", error);
    return [];
  }
}

// Function to save RSVPs
function saveRSVP(rsvp: any) {
  try {
    const current = getRSVPs();
    const newRsvp = {
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      ...rsvp,
    };
    current.push(newRsvp);
    fs.writeFileSync(RSVP_FILE, JSON.stringify(current, null, 2));
    return newRsvp;
  } catch (error) {
    console.error("Error saving RSVP:", error);
    throw error;
  }
}

// API Routes
// 1. Get RSVPs
app.get("/api/rsvp", (req, res) => {
  try {
    const rsvps = getRSVPs();
    res.json({ success: true, data: rsvps });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Submit RSVP
app.post("/api/rsvp", (req, res) => {
  try {
    const { name, attendance, guests, wish, phone } = req.body;
    if (!name || attendance === undefined) {
      return res.status(400).json({ success: false, error: "Nama dan kehadiran diperlukan." });
    }
    const rsvp = saveRSVP({ name, attendance, guests: Number(guests) || 1, wish, phone });
    res.json({ success: true, data: rsvp });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Clear all RSVPs (useful for dashboard testing)
app.post("/api/rsvp/clear", (req, res) => {
  try {
    fs.writeFileSync(RSVP_FILE, JSON.stringify([], null, 2));
    res.json({ success: true, message: "Semua RSVP telah dipadamkan." });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Gemini AI Assistant endpoint
app.post("/api/gemini/generate", async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        success: false,
        error: "Kunci API Gemini (GEMINI_API_KEY) tidak dikonfigurasikan di pelayan.",
      });
    }

    const { prompt, systemInstruction, temperature } = req.body;
    if (!prompt) {
      return res.status(400).json({ success: false, error: "Prompt diperlukan." });
    }

    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: systemInstruction || "Anda adalah pembantu AI pakar reka bentuk grafik dan penulisan ucapan persaraan berbangsa Melayu.",
        temperature: temperature !== undefined ? Number(temperature) : 0.7,
      },
    });

    res.json({ success: true, text: response.text });
  } catch (err: any) {
    console.error("Gemini API Error:", err);
    res.status(500).json({ success: false, error: err.message || "Ralat semasa menghubungi Gemini API." });
  }
});

// Start server and setup Vite middleware
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Pelayan berjalan di http://localhost:${PORT} (Mod: ${process.env.NODE_ENV || "pembangunan"})`);
  });
}

startServer();
