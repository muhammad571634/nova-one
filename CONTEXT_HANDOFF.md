# Nova One — Loyiha Konteksti va Davom Ettirish Qo'llanmasi (Handoff)

> **Sana:** 2026-09-17  
> **Loyiha papkasi:** C:\Users\joray\nova-one  
> **Arxitektura & Stack:** Next.js 16 (Turbopack), TypeScript, Tailwind CSS, SQLite, HyperFrames 0.8.46

---

## 1. Serverlar va Ishchi Holat
- **Next.js Web Server:** http://localhost:3000 (Faol, fonda ishlamoqda)
- **Showcase / Design Server:** http://localhost:4173 (Faol)
- **Faol Test Job ID (Planning/Storyboard):** job_f239d56bcd40
- **Faol Test Sahifasi (Planning):** http://localhost:3000/projects/job_f239d56bcd40
- **Faol Test Sahifasi (F6 Rendered Video Player):** http://localhost:3000/projects/job_spike_cap
- **Foydalanuvchi Sessiya Cookie:** nova_session=0f7e34ba-de5a-482f-8320-cf1df0b3b717
- **Baza (SQLite):** C:\Users\joray\nova-one-data\nova.db

---

## 2. Oxirgi Bajarilgan Ishlar (Completed Milestones)

1. **Edit Brief Modal (HeyGen Minimalist Dropdowns & Ideas UI):**
   - Foydalanuvchi yuborgan 2-rasmga (HeyGen) to'liq moslashtirildi.
   - Barcha mini tanlov menyulari (Duration, Aspect, Style, Brand System, Voice, Intent) **pastga ochiladigan** (`top-full mt-1.5 left-0 z-50`) qilindi.
   - Barcha ortiqcha uzun matnlar va subtextlar olib tashlandi — faqat kategoriya ikonkasi + qisqa qiymat (`Auto`, `15sec`, `30sec`, `1min` yoki `16:9`, `9:16`, `1:1`).
   - Tanlangan variant HeyGen havorang doira check belgisi (`HeygenCheckCircle`) bilan ko'rsatiladi, qora bloklar olib tashlanib, yorug' minimalist ko'rinishga keltirildi.
   - Captions bitta bosish bilan `ON` / `OFF` qilinadi.
   - Modal ichida scroll qilinganda yoki tashqariga bosilganda ochiq menyular avtomatik yopiladi, `pb-48` orqali pastki variantlar ham bemalol ko'rinadi.
   - **Modern Minimalist Ideas Pills:** Yuborilgan rasm uslubidagi ixcham, chiroyli `Ideas:` tugmalari (`Fast-paced & punchy cuts`, `Explain features step-by-step`, `Dark mode & neon glow`, `Problem-first & high conversion`, `Bold kinetic typography`, `Developer-first & API showcase`). Bosilganda to'g'ridan-to'g'ri `Video Details` oynasiga kiradi, qayta bosilganda o'chadi, faol holatda `✓` bilan belgilanadi.
   - **Bitta bosishda tozalovchi `✕` tugmasi:** Textarea ichida yuqori o'ng burchakda va sarlavha qatorida `✕` (Clear) tugmasi joylashtirildi — tayyor matnni bir zumda to'liq tozalash imkoniyati berildi.
   - **Storyboard Kartalari Tipografiyasi va Vaqt Bug'i Tuzatildi:**
     - `parseDurationSeconds` kasrli sonlarni (`6.243s`, `4.571s`) to'g'ri o'qib, butun songa (`6s`, `5s`, `6s`, `8s`, `7s`) yaxlitlaydigan qilindi.
     - Karta yuzasidagi toshib ketgan 200 belgilik uzun rejissyorlik tavsifi olib tashlandi — karta yuzida faqat ixcham va toza **`01 · Hook · 6s`** badge'i va qalin sarlavha ko'rsatiladi.
     - Batafsil rejissyorlik tavsifi ("Scene Visuals & Direction") esa kartaning "Edit Scene ›" paneliga o'tkazildi.

2. **Phase F6 — File Serving & HTTP Range Video Streaming (`/api/jobs/[id]/files/[...path]`):**
   - Xavfsiz fayl serveri yaratildi: path traversal (directory traversal) hujumlariga qarshi qat'iy tekshiruv.
   - Video streaming uchun HTTP 206 Partial Content (HTTP Range `bytes=start-end`) to'liq qo'shildi — brauzerda video to'xtovsiz va silliq seek bo'ladi.
   - Download rejimi (`?download=true`) orqali MP4 faylni to'g'ridan-to'g'ri yuklab olish imkoniyati.

3. **Phase F6 — Video Player & Review UI (Apple Minimalist):**
   - **Awaiting Render:** Contact sheet skrinshot preview, tekshiruvdan o'tganlik nishoni, katta "Render Video (1080p MP4)" asosiy tugmasi.
   - **Rendering:** Jonli progress bar, gradient ambient aura, kadrlar renderi va FFmpeg GPU konvertatsiya holati.
   - **Done / Video Ready:** 16:9, 9:16 yoki 1:1 proporsiyalariga avtomatik moslashuvchi qora shisha ramkali HTML5 video pleer.
   - **Video Action Toolbar:** "Download MP4", "Copy Link" (avtomatik clipboard va toast), "Open in Tab", "Re-render" tugmalari.
   - **Video Economics & Metrics Kartasi:** Video davomiyligi, fayl hajmi (KB/MB), format (1080p) va sarflangan sun'iy intellekt xarajati ($0.000).

4. **Worker Arxitektura Tuzatmasi:**
   - HyperFrames `init` chaqiruvi tuzatildi: endi ortiqcha `my-video` ichki papkasi yaratilmaydi, to'g'ridan-to'g'ri loyiha ildiziga (`. --non-interactive --skill=product-launch-video`) yoziladi.
   - Render tugagach `renders` jadvaliga yozish, kredit balansidan yechish va `job_events` ga yakuniy status voqeasini yuborish ulandi.

5. **To'liq Tekshiruv:**
   - `pnpm run typecheck` ➔ 0 xato.
   - `pnpm run build` ➔ 0 xato, Turbopack warninglarsiz toza build.
   - HTTP 200 OK: `http://localhost:3000/projects/job_f239d56bcd40`.
   - HTTP 200 OK + HTTP 206 Partial Content: `http://localhost:3000/projects/job_spike_cap` va `/api/jobs/job_spike_cap/files/renders/video.mp4`.

---

## 3. Asosiy Fayllar
- **src/app/api/jobs/[id]/files/[...path]/route.ts** — Video streaming, contact sheet va loyiha aktivlarini xavfsiz tarqatish API'si.
- **src/components/ProjectLiveTracker.tsx** — Storyboard kartalari, Edit Brief modal, Video pleer, Review va iqtisodiy metrikalar.
- **src/app/(app)/projects/[id]/page.tsx** — Loyiha tafsilotlari, render yozuvlari va RSC serializatsiyasi.
- **worker/index.ts** — Avtonom agent va render jarayonlari boshqaruvi.
- **PLAN.md** — Umumiy arxitektura va bosqichlar rejasi.

---

## 4. Yangi Chat Oynasida Davom Ettirish Prompti
Yangi chat oynasi ochganingizda ushbu matnni yuborish kifoya:

C:\Users\joray\nova-one loyihasida ishlayapmiz.
Loyiha holati C:\Users\joray\nova-one\CONTEXT_HANDOFF.md faylida to'liq saqlangan.
Dev server http://localhost:3000 da ishlab turibdi.
Shu yerdan davom ettiramiz.
