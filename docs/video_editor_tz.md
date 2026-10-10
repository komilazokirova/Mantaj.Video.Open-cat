# 🎬 Veb-Video Montaj Dasturi (CapCut Muqobili) — Texnik Vazifa (TZ)

---

## 1. Loyiha haqida umumiy ma'lumot
* **Loyiha nomi**: OpenCut Web (shartli nom)
* **Turi**: Veb-brauzerda to'liq ishlaydigan zamonaviy, professional ko'p qatlamli video tahrirlash (montaj) platformasi.
* **Asosiy maqsad**: CapCut kabi qulay, zamonaviy va tezkor interfeys yaratish hamda CapCut'ning pullik (Pro) versiyasidagi eng talabgir funksiyalarini foydalanuvchilarga mutlaqo **bepul, cheklovlarsiz va suv belgisiz (watermark-free)** taqdim etish.
* **Ishlash mexanizmi**: Foydalanuvchi ma'lumotlari serverga yuklanmasdan, barcha og'ir video/audio ishlov berish to'g'ridan-to'g'ri foydalanuvchi qurilmasida (Client-side / WebAssembly / WebCodecs / WebGPU) amalga oshiriladi. Bu maxfiylikni ta'minlaydi va server xarajatlarini nolga tenglashtiradi.

---

## 2. 💎 CapCut Pro'dagi pullik funksiyalarning bepul muqobillari

CapCut hozirda quyidagi eng mashhur funksiyalarni Pro (pullik) qilib qo'ygan. Biz ushbu imkoniyatlarni ochiq brauzer texnologiyalari bilan to'liq bepul qilamiz:

| CapCut Pro pullik funksiyasi | Bizning bepul yechimimiz | Texnik mexanizm |
| :--- | :--- | :--- |
| **Avtomatik Subtitrlar (Auto-Captions)** | Matnlarni nutqdan avtomatik ajratib, animatsiyali subtitr yaratish | Web Speech API va brauzerda ishlovchi yengil AI Whisper (ONNX / Transformers.js) |
| **Orqa fonni olib tashlash (Smart Cutout)** | Yashil fonsiz (Green screen-siz) odamni fondan ajratish | MediaPipe Selfie Segmentation (WebAssembly/WebGL) |
| **Xromakey (Chroma Key)** | Yashil/ko'k fonni tozalash | WebGL / Canvas shaderlari orqali real vaqtda fonni o'chirish |
| **4K / 60 FPS va Yuqori Bitrate Eksport** | Cheklovlarsiz yuqori sifatda eksport qilish | WebCodecs API + mp4-muxer (apparat tezlashuvi yordamida) |
| **Tezlik egri chizig'i (Curve Speed / Speed Ramping)** | Videoni dinamik sekinlashtirish/tezlashtirish | Bezier egri chizig'i asosidagi freymlararo tezlik kontrolleri |
| **Kalit kadrlar (Keyframes)** | Harakat, o'lcham, shaffoflikni vaqt bo'yicha erkin animatsiya qilish | Har bir element uchun Transform Keyframe tizimi |
| **Audio shovqinni tozalash (Noise Reduction)** | Ovozdan shovqin va shamol ovozlarini olib tashlash | Web Audio API (BiquadFilter va AudioWorklet filtrlari) |
| **Suv belgisiz (No Watermark) bepul eksport** | Yakuniy videoda hech qanday logotip yoki reklama bo'lmaydi | 100% toza Canvas va FFmpeg render |

---

## 3. 🖥 Interfeys (UI / UX) Tuzilishi

CapCut interfeysi kabi qulay, intuitiv va qorong'u (Dark mode) zamonaviy dizayn:

```
+-----------------------------------------------------------------------------------+
|  [Logo / Nomi]    [Format: 9:16 v]   [Undo/Redo]            [EXPORT (4K/1080p)]   |
+----------------------+------------------------------------+-----------------------+
|  MEDIA VA RESURSLAR  |           PREVIEW PLAYER           |    ELEMENT SOZLAMASI  |
|                      |                                    |                       |
|  - Videolar          |        +------------------+        |  Transform:           |
|  - Ovozlar           |        |                  |        |  - O'lcham (Scale)    |
|  - Matnlar           |        |    9:16 Video    |        |  - Pozitsiya (X, Y)   |
|  - Filtrlar/LUT      |        |                  |        |  - Aylantirish        |
|  - Stikerlar         |        |                  |        |  - Opacity (Shaffoflik|
|  - Subtitrlar (AI)   |        +------------------+        |  Filtrlar & Rang:     |
|                      |     [|<] [<<] [ > ] [>>] [>|]      |  - Brightness/Contrast|
|                      |     00:01:24:12 / 00:03:00:00      |  - Chroma Key         |
+----------------------+------------------------------------+-----------------------+
|  TIMELINE BOSHQARUVI: [Kesish / Split] [O'chirish] [Zoom +/-] [Audio ajratish]    |
|-----------------------------------------------------------------------------------|
|  T1 (Matn/Subtitr) : |--- Subtitr 1 ---|   |--- Subtitr 2 ---|                    |
|  V2 (Overlay Video):         |===== Kichik video / Stiker =====|                  |
|  V1 (Asosiy Video) : |=============== Video 1 =============|=== Video 2 ===|      |
|  A1 (Ovoz / Musiqa): |~~~~~~~~~~~~~~~~ Fon Musiqasi ~~~~~~~~~~~~~~~~~~~~~~~~~~|   |
+-----------------------------------------------------------------------------------+
```

---

## 4. ⚙️ Funksional Talablar

### 4.1. Media boshqaruvi
* Video, rasm va audio fayllarni **Drag & Drop** orqali yuklash.
* Formatlar: MP4, MOV, WebM, MP3, WAV, AAC, PNG, JPG, WebP.
* Fayllar brauzer xotirasiga (IndexedDB / Cache) saqlanadi, qayta ochganda yo'qolib ketmaydi.

### 4.2. Ko'p Qatlamli Timeline (Vaqt Shkalasi)
* **Cheksiz treklar**: Asosiy video, overlay (ustma-ust videolar), matn qatlamlari, audio treklar.
* **Kesish vositalari**:
  * **Split (Qirqish)**: Videoni kursor turgan joyidan ikkiga bo'lish (`Ctrl+B` yoki qaychi belgisi).
  * **Trim (Qisqartirish)**: Boshidan yoki oxiridan surib qisqartirish.
  * **Ripple Delete**: Bo'shliq qoldirmasdan o'chirish.
* **Snap & Magnet**: Kadrlarni bir-biriga yopishtirish va magnitlash.
* **Timeline masshtabi**: Sekund va kadrlar aniqligida kattalashtirish (Zoom in / Zoom out).

### 4.3. Video va Vizual Effektlar
* **Formatlar (Canvas Aspect Ratios)**:
  * `9:16` — TikTok, Instagram Reels, YouTube Shorts
  * `16:9` — YouTube, Gorizontal format
  * `1:1` — Instagram kvadrat post
  * `4:5` — Portret format
* **Rang sozlamalari (Color Grading)**:
  * Brightness, Contrast, Saturation, Temperature, Tint, Vignette, Blur.
* **Aralashtirish rejimlari (Blend Modes)**:
  * Normal, Screen, Multiply, Overlay, Lighten (videolarni bir-biriga chiroyli qo'shish).

### 4.4. Audio Tahrirlash
* Videodan ovozni alohida ajratib olish (**Extract Audio**).
* Audio Fade In / Fade Out (sekin ko'tarilish va so'nish).
* Ovoz balandligini sozlash (Volume: 0% dan 200% gacha).
* Ovoz yozish: Mikrofondan to'g'ridan-to'g'ri loyihaga ovoz yozib qo'shish (Voiceover).

### 4.5. Matn va Avto-Subtitrlar (Captions)
* Erkin matn qo'shish, turli shriftlar, ranglar, soyalar (Shadow), orqa fon (Background).
* Matn uslublari va animatsiyalari (Fade, Typewriter, Pop).
* **Avto-Subtitr generatori**: Videodagi gaplarni aniqlab, vaqt bo'yicha mos tushadigan subtitrlarni 1 tugma bilan avtomatik qo'yish.

### 4.6. Eksport Tizimi
* Format: **MP4 (H.264 / AAC)** yoki **WebM**.
* Rezolyutsiyalar: 720p, 1080p (Full HD), 1440p (2K), 2160p (4K).
* Kadrlar tezligi: 24, 30, 60 FPS.
* Hech qanday suv belgisiz (Watermark-siz) to'liq bepul eksport.

---

## 5. 🏗 Tavsiya etilgan Texnologik Stek

| Qism | Texnologiya | Sababi |
| :--- | :--- | :--- |
| **Framework** | **React 18/19 (yoki Next.js)** + **Vite** | Juda tez ishlaydi, komponentlar arxitekturasi qulay |
| **Styling** | **Tailwind CSS** + **Lucide Icons** | Zamonaviy qorong'u rejim, moslashuvchan interfeys |
| **Holat boshqaruvi (State)** | **Zustand** | Timeline, kadrlar va qatlamlarni yuqori unumdorlikda boshqarish |
| **Canvas / Render** | **HTML5 Canvas 2D + WebGL** | Real-time freym generatsiyasi va effektlar |
| **Eksport & Kodlash** | **WebCodecs API** + **mp4-muxer** (yoki **FFmpeg.wasm**) | Brauzerning o'zida apparat tezlashuvli MP4 render |
| **Audio ishlov berish** | **Web Audio API** | Ko'p trekli audio mikser, shovqin filtri |
| **Lokal Xotira** | **IndexedDB** | Katta videolarni brauzer xotirasida yo'qotmasdan saqlash |

---

## 6. 📅 Ishlab Chiqish Bosqichlari (Roadmap)

1. **1-bosqich (Arxitektura va UI Karkasi)**:
   * Proyektni sozlash (React + Vite + Tailwind).
   * CapCut uslubidagi qorong'u interfeys panellari (Media, Preview, Inspector, Timeline).
2. **2-bosqich (Media va Pleyer)**:
   * Video yuklash, Preview Player'da ijro etish, formatlarni (9:16, 16:9) sozlash.
3. **3-bosqich (Ko'p qatlamli Timeline & Montaj vositalari)**:
   * Vaqt o'qi, kursor (Playhead), kesish (Split), qisqartirish (Trim), surish (Drag).
4. **4-bosqich (Matn, Effektlar va Audio)**:
   * Matn qatlami, rang filtrlari, audio trek va mikser.
5. **5-bosqich (Pro Bepul Funksiyalar)**:
   * Yashil fonni tozalash (Chroma Key), avto-subtitrlar integratsiyasi, kalit kadrlar (Keyframes).
6. **6-bosqich (Eksport va Optimizatsiya)**:
   * Tayyor montajni to'liq MP4 formatda kompyuterga yuklab olish moduli.
