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

1. **Edit Brief Modal (HeyGen UI/UX talabi):**
   - Modal to'liq HeyGen dizayniga keltirildi: katta va toza shriftlar, banner, Script Writer AI tugmasi.
   - Barcha 7 ta variant interaktiv va funksional holatga keltirildi (Duration, Aspect, Visual Style, Captions, Voice, Brand System, Intent Mode).
   - Mini popoverlar tepaga ochiladigan qilindi va tashqariga bosganda darhol yopiladigan backdrop qo'shildi.

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
