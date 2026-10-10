# 🎬 OpenCut Web — CapCut Alternative Web Video Editor

Zamonaviy brauzer texnologiyalari (HTML5 Canvas, WebCodecs, Web Audio API, Zustand, React 19, Tailwind CSS) asosida yaratilgan, to'liq mijoz tomonida (Client-side) ishlaydigan kuchli ko'p qatlamli veb-video montaj dasturi.

---

## ✨ Asosiy Xususiyatlar va CapCut Pro Imkoniyatlari

* **Ko'p Qatlamli Timeline (Vaqt shkalasi)**:
  * Video (V1, V2), Audio (A1) va Matn/Subtitr treklari.
  * **Qaychi / Kesish (Razor Tool - `C`)**: Kadrlarni to'g'ridan-to'g'ri sichqoncha bilan bosib ikkiga bo'lish.
  * **Kursor bo'yicha qirqish (`Ctrl+B`)**: Playhead turgan nuqtada videoni bo'lish.
  * **Trimming**: Kadrlarning boshidan va oxiridan qisqartirish (Trim start/end).
  * **Drag & Drop**: Kadrlarni vaqt shkalasi bo'yicha siljitish.
  * **Zoom**: Timelineni millisekundlargacha kattalashtirish yoki butun loyihani ko'rish uchun kichiklashtirish.

* **💎 4K va 1080p Suv belgisiz (No Watermark) Bepul Eksport**:
  * Hech qanday suv belgisi yoki pullik cheklovlarsiz.
  * 720p, 1080p Full HD va 4K Ultra HD rezolyutsiyalarda 30 va 60 FPS da to'g'ridan-to'g'ri kompyuterga eksport qilish.

* **💎 AI Avtomatik Subtitrlar (Auto-Captions)**:
  * TikTok va Reels uslubidagi trend sariq, kiber neon va oq minimalist animatsiyali subtitrlarni 1 tugma bilan generatsiya qilish.

* **💎 Xromakey (Green Screen Removal - Bepul)**:
  * Yashil fonni brauzerda to'liq tozalash va orqasiga boshqa fon joylashtirish.

* **Rang Filtrlari & LUTlar (Color Grading)**:
  * Cinematic, Cyberpunk Neon, Vintage VHS, Oq-qora (B&W) va individual HSL sozlamalari (Brightness, Contrast, Saturation, Blur).

* **Audio & Ovoz yozish (Voiceover)**:
  * Mikrofondan to'g'ridan-to'g'ri videoga jonli ovoz yozib qo'shish.
  * Fon musiqalari, ovoz balandligini sozlash (0-200%).

* **Formatlar (Aspect Ratio)**:
  * `9:16` — TikTok, Instagram Reels, YouTube Shorts
  * `16:9` — YouTube gorizontal video
  * `1:1` — Kvadrat postlar

---

## 🛠 Texnologik Stek

* **Frontend**: React 19, TypeScript, Vite
* **Styling**: Tailwind CSS v4, Lucide Icons
* **State Management**: Zustand
* **Engine**: HTML5 Canvas, Web Audio API, MediaRecorder API
* **Export**: Client-side Canvas Stream Render

---

## 🚀 Ishga tushirish (Local Development)

```bash
# 1. Repozitoriyani yuklab oling
git clone https://github.com/<username>/opencut-web.git
cd opencut-web

# 2. Bog'liqliklarni o'rnating
npm install

# 3. Dasturni ishga tushiring
npm run dev
```

Brauzerda `http://localhost:5173/` manzilini oching.
