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

4. **Phase F7 — Matnli Tahrirlash ("Describe a change") & HyperFrames Studio:**
   - **Studio fon serveri menejeri (`src/lib/studio.ts`):** Dynamic port tekshiruvi (3050–3099 oraliq), `npx hyperframes preview . --port <port> --no-open` background jarayonini ishga tushirish, HTTP 200 liveness tekshiruvi va xavfsiz to'xtatish (`taskkill` process tree).
   - **Studio API (`/api/jobs/[id]/studio`):** GET (status/port/url), POST (ishga tushirish va Studio URL qaytarish), DELETE (serverni to'xtatish) endpointlari.
   - **Action API (`/api/jobs/[id]/action`):** `action: 'edit'` qo'llab-quvvatlandi, `.hyperframes/edit-request.json` fayliga buyruq yoziladi, status `queued_editing` ga o'tkaziladi.
   - **Worker integratsiyasi (`worker/index.ts`):** `queued_editing` navbati ulandi, Claude prompti (`product-launch-video` skill bilan `videos/<slug>` dagi fayllarni tahrirlash) tuziladi, `--resume <claude_session_id>` orqali tahrir qilinadi, lint & check o'tkaziladi va loyiha `awaiting_render` holatiga qaytariladi.
   - **Render zaxiralash (Versioning):** Har safar qayta render qilinganda oldingi `video.mp4` o'chib ketmasligi uchun avtomatik `video_v<timestamp>.mp4` zaxira nusxasi olinadi.
   - **UI komponentlari (`src/components/ProjectLiveTracker.tsx`):**
     - Top Header: `Open in Studio` tugmasi va faol Studio port indikatori (`Studio :3050`).
     - Awaiting Render (Review) bo'limi: `Open in Studio` tugmasi hamda "Describe a Change to the Video" matn kiritish paneli va tezkor takliflar (pills).
     - Done (Video Ready) bo'limi: Action toolbar ichida `Open in Studio` tugmasi va video ostida "Want to Change Something in this Video?" tahrirlash kartasi.
     - Pastki suzuvchi composer (`canvas-composer`): Loyiha `awaiting_render` yoki `done` holatida bo'lganda, foydalanuvchi yozgan har qanday o'zgartirish so'rovi avtomatik tarzda `edit` harakati orqali agentga yuboriladi.

5. **Phase F8 — Soxta To'lov va Kreditlar Tizimi (Billing Engine & Guards):**
   - **Upgrade API (`/api/billing/upgrade`):** POST orqali soxta to'lov oqimi (Pro: +30 kredit, Team: +100 kredit), tranzaksiyalar `credit_ledger` ga yoziladi va faol balans yangilanadi.
   - **History API (`/api/billing/history`):** GET orqali foydalanuvchining so'nggi kredit harakatlari ro'yxati olinadi.
   - **Server-side Guards (HTTP 402 Payment Required):** 
     - `POST /api/jobs` da balans 0 bo'lsa yangi job ochish bloklandi.
     - `POST /api/jobs/[id]/action` da `action === 'render'` so'rovi balans 0 bo'lsa 402 xatosi bilan to'xtatildi.
   - **Interaktiv Billing Sahifasi (`src/components/BillingClient.tsx`):**
     - Faol balans kartasi va Pro/Team/Free tier statusi.
     - 3 ta tarif kartasi (Free Starter, Pro Creator, Team & Agency).
     - "Upgrade to Pro (Mock)" / "Upgrade to Team (Mock)" bosilganda Apple-minimalist Mock Checkout modal oynasi (1-Tap demo checkout yoki Test Card).
     - To'lov muvaffaqiyatli o'tgach, real-vaqtda balans animatsiyasi va "Credit Activity History" jadvali yangilanadi.
   - **Review & Render Guard (`src/components/ProjectLiveTracker.tsx`):**
     - Balans 0 bo'lganda sariq ogohlantiruvchi "No Video Credits Remaining" kartasi chiqadi.
     - "Render Video (1080p MP4)" tugmasi qulflanadi (`<Lock />`, "0 Credits (Upgrade to Render)").
     - Sahifadan chiqmasdan to'g'ridan-to'g'ri kredit to'ldirish uchun in-place "Upgrade to Render" modal oynasi ochiladi va kredit qo'shilgach, tugma shu zahotiyoq ochiladi.
   - **New Video Formasi (`src/app/(app)/new/page.tsx`):**
     - 0 kredit qolganda yuqorida ogohlantirish banneri va `/billing` havolasi ko'rsatiladi.

6. **Phase F9 — Oddiy Vizual Muharrir (Simple Visual Editor / Studio Soddalashtirish):**
   - **Simple Visual Editor UI (`src/components/SimpleVisualEditor.tsx`):**
     - Katta va silliq Stage Preview oynasi (16:9, 9:16, 1:1 formatlariga moslashadi, jonli tipografiya va subtitr bilan).
     - Sahna inspektori: On-Screen Headline, Voiceover Script (so'zlar hisoblagichi bilan), davomiylik steppyerlari (`- 1s`, `+ 1s`), Visual Direction bloki va har bir sahna uchun alohida AI yordamchi prompti.
     - Pastki gorizontal Timeline Filmstrip: har bir sahna kadrining vizual kartochkasi, kadr turi (`Hook`, `Intro`, `CTA`...), vaqt ko'rsatkichi va tezkor sahna tanlash.
   - **Scene Persistence API (`/api/jobs/[id]/scenes`):**
     - GET orqali `STORYBOARD.md` parsed kadrlarini olish.
     - POST orqali foydalanuvchi kiritgan o'zgarishlarni to'g'ridan-to'g'ri `STORYBOARD.md` ga yozish (`serializeStoryboardMarkdown`).
   - **UI Integratsiyasi (`src/components/ProjectLiveTracker.tsx`):**
     - Canvas View Toggle: "Player", "Visual Editor" va "Advanced: Studio" o'rtasida bir zumda o'tish.
     - "Save & Render" orqali to'g'ridan-to'g'ri yangilangan sahnalar bilan video renderini ishga tushirish.

7. **Multi-Aspect Ratio (9:16 Portrait & 1:1 Square) Qo'llab-quvvatlash:**
   - **BRIEF.md avto-destination:** `aspect: 1080x1920` bo'lsa avtomatik `destination: tiktok`, `1080x1080` bo'lsa `destination: social-feed`, `1920x1080` bo'lsa `destination: website` qilib shakllantiriladi.
   - **Agent ko'rsatmalari (`worker/host-contract.md`):** Headless agentga 9:16 da elementlarni vertikal stack qilish, sarlavhani yuqori 30% ga joylash, mahsulot UI'larini kattalashtirib (zoom) ko'rsatish va pastki 17% subtitr xavfsiz zonasini saqlash qat'iy topshirildi.
   - **Storyboard & Persistence (`src/lib/storyboard-parser.ts`):** `format` maydoni to'liq o'qiladi va qayta saqlashda yo'qolib ketmaydi.
   - **Simple Visual Editor & Live Tracker UI:** 9:16 tanlanganda sahna tahrirlash oynasi haqiqiy iPhone Dynamic Island va mobil ramkasiga aylanadi, subtitr va matnlar avtomatik vertikal markazga tushadi.

8. **To'liq Tekshiruv:**
   - `pnpm run typecheck` ➔ 0 xato (qat'iy TypeScript).
   - `pnpm run build` ➔ 0 xato, Next.js 16 (Turbopack) ishlab chiqarish buildi toza yakunlandi.
   - 9:16 va 1:1 brief generatori to'liq test qilindi.
   - `GET /api/jobs/job_spike_cap/scenes` orqali barcha 7 ta kadr to'liq va xatosiz o'qilishi tekshirildi.
   - `STORYBOARD.md` to'liq 7 ta kadri bilan saqlab qo'yildi.
   - Mock upgrade API va history API to'liq test qilindi (balans 1 dan 31 ga oshdi).
   - 0-kreditli test foydalanuvchisi bilan render qilganda HTTP 402 guard to'g'ri ishlashi isbotlandi.

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
