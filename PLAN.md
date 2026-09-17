# Nova One — ishlaydigan prototip rejasi

> **Maqsad:** login'dan MP4 yuklab olishgacha bo'lgan butun jarayonni o'z kompyuteringizda, haqiqiy AI agent va haqiqiy render bilan ko'rish.
> **Ish usuli:** hammasini birdaniga qurmaymiz. Har bir bosqich kichik bo'ladi, uni ko'z bilan tekshirasiz, keyin navbatdagisiga o'tamiz.
> **Holat:** reja · 2026-09-17 · HyperFrames CLI `0.8.46` · Claude Code `2.1.273` · Node `24.14.0`

---

## 0. Qisqacha

| | Prototipda | Prototipda **emas** |
|---|---|---|
| Foydalanuvchi | Faqat siz, bir vaqtda bitta video | Internetdagi boshqa odamlar |
| Video turi | Product launch (URL'dan promo) | Explainer, musiqa, PR va boshqa workflow'lar |
| Format | 16:9 (1920×1080) | 9:16, 1:1 |
| Agent | Kompyuteringizdagi Claude Code, fonda | Anthropic API kaliti, bulutdagi agent |
| Ovoz va musiqa | HeyGen, bepul akkaunt (OAuth) | Pullik HeyGen API |
| Render | Kompyuteringizda, `hyperframes render` | Lambda, Cloud Run |
| To'lov | Soxta: tariflar sahifasi va kreditlar hisobi | Haqiqiy global to'lov |
| Mahsulot tili | Ingliz tili (global mahsulot) | — |

**Asosiy g'oya:** biz video yasash mantiqini **o'zimiz yozmaymiz**. HeyGen'ning `product-launch-video` skill'i buni allaqachon qiladi. Bizning ish — shu skill'ni **odamsiz ishga tushirish** va uning chatdagi savollarini **tugmali ekranlarga aylantirish**.

---

## 1. Tekshirilgan faktlar (reja shularga tayanadi)

Har bir fakt hujjatdan yoki shu kompyuterdagi sinovdan olingan. Manbalar oxirida (§ 14).

### 1.1 Kompyuter muhiti — 2026-09-17 da tekshirildi

| Narsa | Holat |
|---|---|
| Node.js | ✅ `v24.14.0` |
| pnpm | ✅ `10.34.5` |
| FFmpeg | ✅ `9.0.1` |
| Git | ✅ `2.55.0` |
| Chrome | ✅ o'rnatilgan |
| Claude Code CLI | ✅ `2.1.273` |
| `claude -p` headless | ✅ **sinaldi, ishladi**: JSON'da `session_id`, `total_cost_usd`, `usage`, `num_turns`, `permission_denials`, `subagent_stats` qaytdi |
| `node:sqlite` (Node ichidagi SQLite) | ✅ ishladi (faqat "experimental" ogohlantirishi chiqadi) |
| `heygen` CLI | ❌ yo'q, **Windows'da umuman ishlamaydi** (rasmiy hujjat WSL tavsiya qiladi). TTS uchun kerak emas — § 1.3 |
| HyperFrames oxirgi versiya | `0.8.46` (showcase loyihasida `0.8.40` pin qilingan) |
| `C:\Users\joray\CLAUDE.md` | yo'q — bu yaxshi, agent ishiga aralashmaydi |

### 1.2 `product-launch-video` skill'i aslida qanday ishlaydi

Manba: [skills/product-launch-video/SKILL.md](https://github.com/heygen-com/hyperframes/blob/main/skills/product-launch-video/SKILL.md)

| Qadam | Nima qiladi | Diskda paydo bo'ladigan fayl | Pauza bormi |
|---|---|---|---|
| 0 Setup | `hyperframes init`, `BRIEF.md`, HeyGen'ga kirish holati | `hyperframes.json`, `BRIEF.md` | Faqat HeyGen'ga kirilmagan bo'lsa |
| 1 Capture | `npx hyperframes capture "<URL>" -o ./capture --json` | `capture/extracted/tokens.json`, `visible-text.txt`, `asset-descriptions.md` | Sayt bloklasa — **qat'iy to'xtaydi** (`capture/BLOCKED.md`) |
| 2 Dizayn | 13 ta presetdan birini brend ranglariga moslaydi (`build-frame.mjs`) | `frame.md`, `.hyperframes/caption-skin.html` | Yo'q |
| 3 Storyboard | Kadrma-kadr reja va diktor matni | `STORYBOARD.md`, `SCRIPT.md` | ✅ **Pauza 1: rejani tasdiqlash** |
| 3.1 Audio | Ovoz (TTS), so'z vaqtlari, musiqa (fonda ishlaydi) | `audio_meta.json` | Yo'q |
| 4 Vizual dizayn | Har bir kadrga shot ketma-ketligi; ixtiyoriy eskiz bosqichi | boyitilgan `STORYBOARD.md`, `assets/` | Eskiz tanlansa — pauza (biz **o'tkazib yuboramiz**) |
| 5 Kadrlar | Har bir kadr uchun alohida sub-agent, yig'ish, subtitr | `compositions/frames/NN-*.html`, `index.html`, `caption_groups.json` | Yo'q |
| 6 Yakun | transitions, `lint`, `check`, `snapshot` | `snapshots/contact-sheet.jpg` | ✅ **Pauza 2: "Render qilaymi?"** |
| Render | `npx hyperframes render --quality high --output renders/video.mp4` | `renders/video.mp4` | — |

**Reja uchun muhim uchta qoida** (skill va `brief-format.md`'dan):

1. **`BRIEF.md` bor bo'lsa, agent hech qanday savol bermaydi.** Bizning forma aynan shu faylni yozadi.
2. **`BRIEF.md` faqat `hyperframes init`'dan KEYIN yoziladi.** `init` bo'sh bo'lmagan papkani rad etadi. Shuning uchun tartib: worker `init` qiladi → `BRIEF.md` yozadi → agentni ishga tushiradi.
3. **Render har doim foydalanuvchi ruxsati bilan qilinadi.** Agent o'zi render qilmaydi. Render tugmasini bizning ilova bosadi — bunga LLM kerak emas, xarajat ham yo'q.

**`BRIEF.md`'dagi `flow: automation` va `storyboard: yes`** birgalikda `collaborative` rejimni beradi: agent reja tayyor bo'lganda va render oldidan to'xtaydi. Bizga aynan shu kerak.

**`style_preset` maydoni:** *"the user picked it by eye from the showcases"*. Ya'ni uslub kartochkalari = 13 ta presetning `frame-showcase.html` fayllari. Ular `~/.claude/skills/hyperframes-creative/frame-presets/<nomi>/` papkasida tayyor turibdi.

**Izohlar kanali:** Studio'dagi kadr izohlari `.hyperframes/frame-comments.json` fayliga yoziladi. Bizning "3-kadrni o'zgartir" tugmamiz ham **aynan shu formatda** yozadi — agent uni rasmiy yo'l bilan o'qiydi.

**Storyboard parser:** `@hyperframes/core/storyboard` rasmiy eksport sifatida mavjud (npm'da tekshirildi). `STORYBOARD.md`'ni o'zimiz parse qilmaymiz, rasmiy parserdan foydalanamiz.

### 1.3 Ovoz va musiqa — HeyGen, bepul yo'l

Manbalar: [Authentication](https://hyperframes.heygen.com/guides/authentication), `media-use/audio/scripts/lib/heygen.mjs`

- Kirish: `npx hyperframes auth login` — brauzerda OAuth ochiladi, `~/.heygen/credentials` fayliga yoziladi. **`heygen` CLI kerak emas.**
- TTS skripti HeyGen REST API'ga **to'g'ridan-to'g'ri** murojaat qiladi. OAuth token bilan so'rov yuborilganda backend **bepul limit** beradi. API kalit bilan esa **pullik API kreditlar** ishlatiladi.
- ⚠️ **Kalitni ENV'ga qo'ymang.** Kalitni tanlash tartibi: `HEYGEN_API_KEY` → `HYPERFRAMES_API_KEY` → `~/.heygen/credentials`. Agar `HEYGEN_API_KEY` o'rnatilsa, u OAuth'dan **ustun** turadi. Balansingiz nol bo'lgani uchun ovoz **ishlamay qoladi**. Hozircha API kalit bizga kerak emas.
- 🔐 Chatga yozilgan kalitni HeyGen'da **o'chirib, yangisini yarating**. Bu reja hech qaysi faylga kalit yozmaydi.
- Kirilmagan bo'lsa, lokal zaxira ishlaydi: ovoz uchun Kokoro, musiqa uchun MusicGen. Prototipda esa ishni boshlashdan oldin kirish **majburiy** (§ 6.2).
- Bepul limit hajmi hujjatda yozilmagan → F1'da o'lchaymiz.

### 1.4 Claude Code headless

- `claude -p "<prompt>" --output-format stream-json --verbose` — real vaqtda voqealar oqimi (progress ekrani uchun).
- `--resume <session_id>` — agent to'xtagan joyidan kontekst bilan davom etadi (pauzadan keyin).
- `--append-system-prompt` — "host shartnomasi" (§ 7.3).
- `--permission-mode` — `auto` / `bypassPermissions` / … (§ 11, xavf 6).
- `--max-budget-usd` — xavfsizlik chegarasi (faqat `-p` bilan ishlaydi).
- **Sinov:** eng oddiy "ok" javobi ham `total_cost_usd: 0.039` ko'rsatdi — bu faqat tizim kontekstini yuklash narxi. Obunada bu raqam **API'dagi ekvivalent narx**. Kelajakda API kalitga o'tganda bitta video qanchaga tushishini aynan shu raqam ko'rsatadi.
- ⚠️ **Obuna faqat o'zingiz sinashingiz uchun.** Boshqa odamlarga xizmat ko'rsatish uchun Anthropic API kaliti kerak.

---

## 2. Arxitektura

```
BRAUZER (localhost:3000)
┌───────────────────────────────────────────────────────────┐
│ Next.js ilova                                             │
│  Login · Projects · New video · Project sahifasi · Billing │
│  Progress (SSE) · Storyboard · Review · Result            │
│  <hyperframes-player>  ·  "Open in Studio" (yangi tab)    │
└───────────────────────────────────────────────────────────┘
           │ HTTP + SSE                     ▲ fayllarni o'qiydi
           ▼                                │
┌──────────────────────────┐      ┌────────────────────────────────┐
│ SQLite (nova.db)         │◄────►│ WORKER (alohida Node jarayoni) │
│ users · sessions · jobs  │      │ navbat: bir vaqtda 1 ta ish    │
│ agent_runs · job_events  │      │ 1. auth status tekshiruvi      │
│ renders · credit_ledger  │      │ 2. hyperframes init            │
└──────────────────────────┘      │ 3. BRIEF.md yozadi             │
                                  │ 4. claude -p (stream-json)     │
                                  │ 5. fayllarga qarab bosqichlar  │
                                  │ 6. hyperframes render          │
                                  └───────────────┬────────────────┘
                                                  ▼
                        C:\Users\joray\nova-one-data\jobs\<jobId>\
                          videos\<slug>\   ← HyperFrames loyihasi
                          logs\*.jsonl     ← agent voqealari
```

**Nima uchun worker alohida jarayon:** agent o'nlab daqiqa ishlashi mumkin. Next.js dev server fayl o'zgarganda qayta ishga tushadi va ichidagi jarayonlarni o'ldiradi. Alohida worker esa ilova qayta yuklansa ham ishlashda davom etadi.

**Nima uchun ma'lumotlar `nova-one-data` papkasida, `nova-one` ichida emas:** Claude Code yuqoridagi papkalardagi `CLAUDE.md` fayllarni o'zi o'qiydi. Ilovani qurish uchun `nova-one\CLAUDE.md` yozsak, u video yasayotgan agentga ham ta'sir qilib qoladi. Ma'lumotlar yonidagi alohida papkada bo'lsa, bu muammo bo'lmaydi.

---

## 3. Texnologiyalar

| Qatlam | Tanlov | Sabab |
|---|---|---|
| Ilova | Next.js 16 (App Router) + TypeScript | Frontend va API bitta joyda |
| Paket menejeri | pnpm | O'rnatilgan, tez |
| Stil | Tailwind CSS v4 + o'z dizayn tokenlarimiz | Tipografiya va UI'ni to'liq o'zimiz boshqaramiz (F2) |
| Ma'lumotlar bazasi | `node:sqlite` | Windows'da native build kerak emas. Muammo chiqsa → `better-sqlite3` |
| Auth | O'zimiz: `crypto.scrypt` + httpOnly cookie sessiya | Lokal prototip uchun yetarli, tashqi servis yo'q |
| Real vaqt | SSE (Server-Sent Events) | Oddiy, bir tomonlama oqim |
| Worker | Node + `tsx` | Xuddi shu TypeScript kodini ishlatadi |
| Video | `hyperframes@0.8.46` (pin) | Qayta render bir xil natija berishi uchun |
| Storyboard | `@hyperframes/core/storyboard` | Rasmiy parser |
| Preview | `@hyperframes/player` | Rasmiy web component |

---

## 4. Papkalar tuzilmasi

```
C:\Users\joray\nova-one\              ← kod (git)
  PLAN.md
  package.json
  .env.local.example                  ← kalitlar YO'Q, faqat sozlamalar
  src/
    app/
      (auth)/login · (auth)/signup
      (app)/projects · (app)/new · (app)/projects/[id] · (app)/billing
      api/  auth · jobs · jobs/[id]/events (SSE) · jobs/[id]/files/[...path]
    lib/  db.ts · auth.ts · jobs.ts · storyboard.ts · presets.ts
    components/
  worker/
    index.ts                          ← navbat sikli
    claude-runner.ts                  ← claude -p spawn + stream-json parse
    pipeline.ts                       ← holatlar mashinasi
    milestones.ts                     ← fayllarga qarab bosqichni aniqlash
    brief.ts                          ← formadan BRIEF.md yasash
    host-contract.md                  ← agentga beriladigan qoidalar (§ 7.3)
  spike/                              ← F1: UI'siz sinov
    REPORT.md

C:\Users\joray\nova-one-data\         ← ma'lumotlar (git'ga kirmaydi)
  nova.db
  jobs\<jobId>\
    videos\<slug>\ ...
    logs\run-plan.jsonl · run-build.jsonl · render.log
```

---

## 5. Ma'lumotlar modeli (SQLite)

```sql
users         (id, email UNIQUE, password_hash, created_at)
sessions      (id, user_id, expires_at)
jobs          (id, user_id, status, source_url, brief_json, slug,
               job_dir, project_dir, claude_session_id, error, created_at, updated_at)
agent_runs    (id, job_id, kind, started_at, ended_at, exit_code, claude_session_id,
               total_cost_usd, input_tokens, output_tokens, cache_read_tokens,
               num_turns, subagent_stats_json, permission_denials_json,
               nova_state, log_path)
job_events    (id, job_id, ts, type, payload_json)   -- step | log | tool | milestone | error
renders       (id, job_id, path, duration_s, size_bytes, quality, started_at, ended_at)
credit_ledger (id, user_id, delta, reason, job_id, ts) -- balans = SUM(delta)
```

`agent_runs.kind`: `plan` · `revise` · `build` · `edit`.

### Ish holatlari

```
queued → preparing → planning → awaiting_approval ─┬─ (izoh) → revising → awaiting_approval
                                                   └─ (tasdiq) → building → awaiting_render
awaiting_render → rendering → done
done → (o'zgartirish so'rovi) → editing → awaiting_render
istalgan holat → failed | canceled
```

---

## 6. Ekranlar va har bir qadam

UI tili — ingliz. Har bir ekran faqat **bitta** asosiy harakatga ega.

### 6.1 Login / Signup
Email va parol. Kirgandan keyin `/projects` ochiladi.

### 6.2 New video — 3 qadam

Boshlashdan oldin worker `npx hyperframes auth status` ni tekshiradi (`exit 1` = kirilmagan). Kirilmagan bo'lsa, ekranda *"Connect HeyGen for voice"* yozuvi va buyruq ko'rsatiladi.

| Qadam | Maydonlar | `BRIEF.md`'ga qanday tushadi |
|---|---|---|
| **1. Source** | Website URL · *Promote the product* / *Show the site as-is* | `## Intent` bo'limiga |
| **2. Style** | 13 ta preset kartochkasi (`frame-showcase.html` asosida) + *Auto* | `style_preset: <nomi>` (*Auto* bo'lsa — maydon yozilmaydi) |
| **3. Settings** | Length 30/45/60s · Language · Voice female/male · Key message (ixtiyoriy) | `length`, `language`, `## Customizations`, `message` |

Doimiy qiymatlar: `workflow: product-launch-video`, `flow: automation`, `storyboard: yes`, `destination: website`, `aspect: 1920x1080`.

**`BRIEF.md` namunasi** (worker yozadi):

```markdown
---
workflow: product-launch-video
flow: automation
storyboard: yes
destination: website
aspect: 1920x1080
language: en
length: 45s
style_preset: coral
message: "Ship launch videos in an afternoon"
---

## Intent

Promote the product at https://example.com to prospective customers.
Source URL: https://example.com

## Customizations

- Narration: yes, female voice.
- Captions: on.

## Notes

- Created by the Nova One app; the user answers checkpoints in the app, not in chat.
```

> `message` bo'sh bo'lsa, maydon yozilmaydi va `## Notes`'ga shu qator qo'shiladi: *"message not provided — derive it from the captured site and state it in STORYBOARD.md"*. Agent buni to'g'ri bajaradimi — F1'da tekshiramiz.

### 6.3 Project sahifasi — holatga qarab o'zgaradi

| Holat | Ekranda nima ko'rinadi |
|---|---|
| `preparing` / `planning` | **Progress:** Setup → Capture → Design → Storyboard (fayllar paydo bo'lishiga qarab yashil bo'ladi). Pastda yig'iladigan "Live log" |
| `awaiting_approval` | **Storyboard:** message va arc sarlavhasi, kadr kartochkalari (title, scene, voiceover, duration), `frame.md` palitrasi, sayt skrinshotlari. Har kadrda "Comment" maydoni. Tugmalar: **Approve & build** / **Send comments** |
| `revising` | Progress: "Applying your comments…" |
| `building` | **Progress:** Audio → Frames **N/M** → Assembly → Captions → Checks |
| `awaiting_render` | **Review:** contact sheet, `<hyperframes-player>` preview, **Render video** tugmasi. Qo'shimcha: "Describe a change", "Open in Studio" |
| `rendering` | Render progress bar |
| `done` | **Result:** video pleer, **Download MP4**, davomiylik va hajm. Ichki karta: agent narxi, tokenlar, vaqt |
| `failed` | Tushunarli sabab (masalan, `capture/BLOCKED.md` matni) + **Retry** |

### 6.4 Bosqichlarni fayllarga qarab aniqlash

Agent chiqishini emas, **diskdagi fayllarni** kuzatamiz. Bu ishonchliroq:

| Bosqich | Belgisi |
|---|---|
| Setup | `hyperframes.json` + `BRIEF.md` |
| Capture | `capture/extracted/tokens.json` bor, `capture/BLOCKED.md` yo'q |
| Design | `frame.md` |
| Storyboard | `STORYBOARD.md` (+ `SCRIPT.md`) |
| Audio | `audio_meta.json` |
| Frames N/M | `STORYBOARD.md`'da `status: animated` bo'lgan kadrlar soni / jami kadrlar |
| Assembly | `index.html` |
| Captions | `caption_groups.json` |
| Checks | `snapshots/contact-sheet.jpg` + worker o'zi `npx hyperframes check` ni ishga tushiradi (exit code) |
| Render | `renders/video.mp4` |

---

## 7. Agentni boshqarish — eng muhim qism

### 7.1 Ishga tushirish tartibi

| Run | Qachon | Buyruq |
|---|---|---|
| **plan** | Yangi ish | `claude -p "<PLAN>" …` |
| **revise** | Kadrlarga izoh yuborilganda | `frame-comments.json` yoziladi → `claude -p "<REVISE>" --resume <sid> …` |
| **build** | Reja tasdiqlanganda | `claude -p "<BUILD>" --resume <sid> …` |
| *render* | "Render" bosilganda | **Agent emas:** `npx hyperframes@0.8.46 render --skill=product-launch-video --quality high --output renders/video.mp4` |
| **edit** | "Describe a change" | `claude -p "<EDIT>" --resume <sid> …` → keyin yana render |

Barcha run'lar uchun umumiy flag'lar:

```
--output-format stream-json --verbose
--append-system-prompt "<host-contract.md mazmuni>"
--permission-mode <F1'da tanlanadi: auto yoki bypassPermissions>
--max-budget-usd <sozlama>
cwd = C:\Users\joray\nova-one-data\jobs\<jobId>
```

### 7.2 Run prompt'lari (agentga ingliz tilida)

```text
PLAN:
Use the product-launch-video skill. The project already exists at videos/<slug>
and BRIEF.md there is confirmed. Source URL: <url>.
Run Step 0 through Step 3 and stop at the plan checkpoint.

REVISE:
The user submitted frame comments in videos/<slug>/.hyperframes/frame-comments.json.
Apply them per the review loop and stop at the plan checkpoint again.

BUILD:
The plan is approved. Skip the sketch pass and build in one go.
Run Step 3.1 through the Step 6 checks and stop at the final-look question.

EDIT:
Edit request from the user: "<matn>". Make only this edit in videos/<slug>,
rerun lint and check, and stop.
```

### 7.3 Host shartnomasi (`worker/host-contract.md`)

```text
You are running headless inside the Nova One app. No human reads this chat.
- The user answers checkpoints in the app; the answer arrives as your next message.
  When a workflow says "ask and wait", end your turn with a short summary instead.
- BRIEF.md is confirmed. Never run the intent interview or ask brief questions.
- Do not start or stop `hyperframes preview` / Studio. The app shows the storyboard
  and the preview itself.
- Never run `hyperframes render`. When Step 6 checks pass, end your turn.
- Keep every file inside the current job directory.
- Never write, export, or print API keys. Do not set HEYGEN_API_KEY.
- End every turn with exactly one final line:
  NOVA_STATE: <plan_ready|build_ready|edit_ready|blocked> — <one-line reason>
```

Worker natijani `result` matnining oxirgi qatoridagi `NOVA_STATE`'dan o'qiydi, keyin **fayllar orqali qayta tekshiradi**. Agent "tayyor" desa-yu, `STORYBOARD.md` bo'lmasa, holat `failed` bo'ladi.

### 7.4 Windows'ga xos jihatlar

- `claude` — bu npm shim (`claude.cmd`). Uni `spawn("claude.cmd", args)` yoki `shell: true` bilan chaqirish kerak.
- Bekor qilish: `taskkill /PID <pid> /T /F` — sub-agentlar va render Chrome jarayonlari bilan birga butun daraxtni o'chiradi.
- Watchdog: run belgilangan vaqtdan oshsa, jarayon to'xtatiladi va holat `failed` bo'ladi (chegara sozlamada).
- Har bir run'ning stream-json qatorlari `logs/run-<kind>.jsonl` ga to'liq yoziladi.

---

## 8. Bosqichlar — qismlarga bo'lib quramiz

Har bir bosqich: **nima quriladi → nimani ko'rasiz → tayyor mezoni.** Bosqich tugamaguncha keyingisini boshlamaymiz.

### F0 — Muhit va kirish · kod yo'q

- `npx hyperframes@0.8.46 doctor`
- `npx hyperframes@0.8.46 auth login` — brauzerda HeyGen bepul akkaunti bilan kirasiz
- `npx hyperframes@0.8.46 auth status` — `oauth` orqali kirilganini ko'rsatishi kerak
- `npx hyperframes skills update product-launch-video` — workflow skill'i o'rnatiladi (hozir yo'q)
- `HEYGEN_API_KEY` o'rnatilmaganini tekshirish
- `C:\Users\joray\nova-one-data` papkasini yaratish

**Ko'rasiz:** terminalda doctor natijasi, "Signed in", o'rnatilgan skill.
**Tayyor:** uchala tekshiruv ham yashil.

> ✅ **F0 bajarildi — 2026-09-17**
> - `auth status`: `oauth`, Billing `subscription`, Plan `free`, token 2026-09-27 gacha amal qiladi
> - `HEYGEN_API_KEY` / `HYPERFRAMES_API_KEY`: na sessiyada, na User/Machine ENV'da yo'q
> - `doctor`: hammasi yashil, ikkita **ixtiyoriy** narsadan tashqari (whisper-cpp, MusicGen — HeyGen'ga kirilgani uchun kerak emas). Kokoro zaxirasi o'rnatilgan. Docker ham bor — keyinchalik sandbox uchun
> - `product-launch-video` o'rnatildi; `SKILL.md` rejada o'qilgan versiya bilan bir xil; uning skriptlari `heygen` CLI'ni chaqirmaydi (Windows xavfi #8 audio uchun yopildi)
> - `C:\Users\joray\nova-one-data\jobs` yaratildi
> - Eslatma: bo'sh RAM 4.3 GB / 15.7 GB — render paytida har bir worker ~256 MB'lik Chrome ochadi

### F1 — SPIKE: pipeline odamsiz, UI'siz · ⚠️ eng xavfli qism

UI qurishdan oldin eng katta noma'lumni tekshiramiz: **skill headless rejimda boshidan oxirigacha ishlaydimi.**

1. Sinov uchun oddiy public sayt tanlanadi (siz tanlaysiz).
2. Qo'lda: `init` → `BRIEF.md` → `claude -p PLAN` → `STORYBOARD.md`'ni ko'rish → `--resume BUILD` → `render`.
3. Avval `--permission-mode auto` bilan sinaymiz. Rad etishlar ishni to'xtatsa → `bypassPermissions` (§ 11, xavf 6).

**O'lchanadigan narsalar → `spike/REPORT.md`:**

| O'lchov | Nima uchun |
|---|---|
| Har bir run vaqti (plan / build / render) | Mijoz qancha kutishi |
| `total_cost_usd`, tokenlar, `num_turns`, `subagent_stats` | Bitta video tannarxi |
| `BRIEF.md` bo'lsa ham savol berdimi | Host shartnomasi ishlayaptimi |
| Preview ochishga yoki render qilishga urindimi | Shartnoma ishlayaptimi |
| `permission_denials` | Qaysi rejim kerak |
| Ovoz provayderi (HeyGen yoki Kokoro) | Bepul yo'l ishlayaptimi |
| `auth status` billing holati — oldin va keyin | Bepul limitdan qancha ketdi |
| `NOVA_STATE` qatori chiqdimi | Worker natijani o'qiy oladimi |

**Ko'rasiz:** ovozli, subtitrli `renders/video.mp4` va raqamlar yozilgan hisobot.
**Tayyor:** MP4 bor, hisobot yozilgan. **Qaror:** davom etamiz yoki host shartnomasini tuzatamiz.

### F2 — Ilova skeleti, dizayn tizimi, login

- Next.js 16 + TypeScript + Tailwind v4, `node:sqlite`, `users` va `sessions` jadvallari
- Signup, login, logout; app shell (sidebar: Projects · New video · Billing)
- **Dizayn tizimi:** shriftlar, tipografiya shkalasi, ranglar, bo'shliqlar, komponentlar (button, card, input, status chip). Bu yerda `frontend-design` skill'idan foydalanamiz.

**Ko'rasiz:** `localhost:3000` → login → bo'sh "Projects" sahifasi, yakuniy uslubda.
**Tayyor:** ro'yxatdan o'tish, kirish, chiqish ishlaydi; sessiya qayta yuklashdan keyin saqlanadi.

### F3 — "New video" oqimi → `BRIEF.md`

- 3 qadamli forma (§ 6.2); 13 ta preset kartochkasi — `frame-showcase.html` iframe preview
- Yuborilganda: `jobs` qatori (`queued`), `brief_json` saqlanadi, loyiha kartochkasi paydo bo'ladi
- Debug panelida yaratiladigan `BRIEF.md` matni ko'rinadi (hali agent ishga tushmaydi)

**Ko'rasiz:** formani to'ldirasiz → loyiha "Queued" holatida chiqadi va `BRIEF.md` ko'rinadi.
**Tayyor:** `BRIEF.md` § 6.2'dagi formatga to'liq mos.

### F4 — Worker + plan run + progress ekrani

- `worker/`: navbat, auth tekshiruvi, `init`, `BRIEF.md`, `claude -p PLAN`, stream-json → `job_events`, fayllardan bosqichni aniqlash, watchdog, bekor qilish
- `/api/jobs/[id]/events` SSE; progress ekrani va live log

**Ko'rasiz:** haqiqiy agent ishlaydi, Setup → Capture → Design → Storyboard birin-ketin yashil bo'ladi.
**Tayyor:** holat `awaiting_approval` ga o'tadi va `agent_runs` qatorida narx yoziladi.

### F5 — Storyboard ekrani → build run

- `@hyperframes/core/storyboard` bilan parse; kadr kartochkalari, palitra, skrinshotlar
- "Send comments" → `.hyperframes/frame-comments.json` (`pass: "storyboard"`) → revise run
- "Approve & build" → build run; progressda Frames **N/M**

**Ko'rasiz:** rejani o'qiysiz → izoh qoldirasiz → reja yangilanadi → tasdiqlaysiz → kadrlar soni o'sib boradi.
**Tayyor:** holat `awaiting_render`, `index.html` va contact sheet mavjud.

### F6 — Review, Render, Result · 🎯 BOSHIDAN OXIRIGACHA

- Review: contact sheet + `<hyperframes-player>` (loyiha fayllari `/api/jobs/[id]/files/...` orqali beriladi)
- "Render video" → worker render qiladi, progress ko'rinadi
- Result: pleer, Download MP4, davomiylik; ichki xarajat kartasi

**Ko'rasiz: login → URL → uslub → storyboard → tasdiq → progress → preview → render → MP4 yuklab olish.** Siz so'ragan "o'z ko'zim bilan ko'rish" aynan shu bosqichda bo'ladi.
**Tayyor:** yuklab olingan MP4 ovoz va subtitr bilan ochiladi.

### F7 — Tahrirlash: "Describe a change" + "Open in Studio"

- Matnli so'rov → edit run → check → Review → qayta render
- "Open in Studio": `npx hyperframes preview --background --port <p>` → yangi tabda `http://localhost:<p>/#project/<slug>`; sahifadan chiqqanda `preview --stop`

**Ko'rasiz:** "Birinchi sarlavhani qisqartir" deb yozasiz → yangi MP4 chiqadi.
**Tayyor:** tahrir qilingan video qayta render bo'ladi, oldingi versiya saqlanib qoladi.

### F8 — Soxta to'lov va kreditlar (global)

- Pricing sahifasi (Free / Pro / Team — maket), balans, soxta "Upgrade"
- 1 render = 1 kredit (`credit_ledger`); balans 0 bo'lsa Render tugmasi bloklanadi

**Ko'rasiz:** renderdan keyin balans kamayadi, 0 bo'lganda "Upgrade" chiqadi.
**Tayyor:** kredit mantiqi to'g'ri ishlaydi.

### F9 — Oddiy muharrir (Studio'ni soddalashtirish) · dizayn yo'nalishi

§ 9'dagi tahlilga asoslanadi. Uch qadam:

1. Oddiy muharrir maketi: katta preview, odamcha nomli sahnalar ro'yxati, har bir sahnaning matn maydonlari, brend ranglari, "Describe a change", "Advanced → Studio".
2. Spike: `@hyperframes/sdk` (`openComposition` → `setText` / `setStyle` → `serialize`) `compositions/frames/NN-*.html` fayllarida xatosiz ishlaydimi va qayta render bilan mos keladimi.
3. Spike muvaffaqiyatli bo'lsa — qurish.

**Tayyor:** oddiy foydalanuvchi timeline'ni ko'rmasdan sarlavhani o'zgartirib, qayta render qila oladi.

---

## 9. Studio tahlili (siz yuborgan skrinshotlar asosida)

### Nima ko'rinyapti

| Joy | Kuzatuv | Oddiy mijoz uchun muammo |
|---|---|---|
| Yuqori panel | `Storyboard / Preview` almashtirgichi, `Capture`, `Inspector`, `Export` | ✅ Storyboard/Preview — zo'r g'oya. ❌ ikkita yashil tugma (Inspector va Export) bir-biri bilan raqobatlashadi |
| Chap panel | `Code · Comps · Assets · Catalog`, `index` yonida `77`, pastda `Lint 1` | ❌ Dasturchi atamalari: "Comps", "Lint", "Code" |
| Markaz | Preview oynasi ekranning taxminan chorak qismini egallaydi | ❌ Asosiy narsa — video — kichik; atrofda bo'sh qora joy ko'p |
| O'ng panel | `Design · Layers · Renders · Variables`, "Record a gesture", "Describe a change to the agent ⌘K" | ✅ "Describe a change" — mijoz uchun eng to'g'ri usul. ❌ "Record a gesture" tushunarsiz. ❌ Windows'da Mac yorlig'i `⌘K` ko'rsatilgan |
| Timeline | Ekranning yarmi; `Bglayer`, `B1…B9`, `Vo01/Vo03/Vo05`, `FX`, 3 marta "waveform unavailable" | ❌ Sahna nomlari ma'nosiz (B1, B2…). ❌ Xira kulrang fon ustidagi yozuvlarni o'qish qiyin. ❌ "waveform unavailable" buzilgandek ko'rinadi |
| Timeline asboblari | Faqat ikonkalar, yozuvsiz (kesish, magnit, keyframe…) | ❌ Professional montaj dasturi tili |
| Storyboard (bo'sh) | "Add a STORYBOARD.md… Hand this prompt to your coding agent… Copy prompt" | ❌ Faqat dasturchi uchun. Bizning mahsulotda bu holat **umuman bo'lmaydi**: storyboard'ni agent o'zi yozadi |

> `showcase` loyihasida `STORYBOARD.md` yo'q, chunki u storyboard oqimisiz qurilgan. Shuning uchun Storyboard ko'rinishi bo'sh chiqqan.

### Xulosa va tavsiya

**Studio — kichik After Effects.** Faqat shrift va ranglarni almashtirish asosiy muammoni hal qilmaydi: muammo tashqi ko'rinishda emas, **mental modelda** (timeline, trek, layer, keyframe).

| Variant | Baho |
|---|---|
| **A. Studio'ni fork qilib, qayta bezash** | ❌ Tavsiya etmayman. Murakkablik o'z joyida qoladi. Upstream tez o'zgaradi (0.8.40 → 0.8.46 bir necha kunda), fork'ni doim yangilab turish og'ir |
| **B. O'z oddiy muharririmizni qurish** (`@hyperframes/sdk` + `<hyperframes-player>`) | ✅ **Tavsiya.** Mijoz ko'radi: katta video, "Hook · Problem · Solution…" nomli sahnalar, matn maydonlari, ranglar, "Describe a change" |
| **C. Asl Studio'ni "Advanced" tugmasi ortida qoldirish** | ✅ B bilan birga. Professional foydalanuvchi uchun hamma narsa saqlanadi |

**Studio'dan olinadigan ikki g'oya:** `Storyboard / Preview` almashtirgichi (reja ↔ video) va **"Describe a change to the agent"**.

**Tartib:** dizaynga kuch avval **o'zimizning ekranlarimizga** (F2–F6) sarflanadi, chunki ular 100% bizniki. Oddiy muharrir esa F9'da, pipeline ishlashi isbotlangandan keyin.

---

## 10. Keyinga qoldirilganlar (prototipdan keyin)

| Mavzu | Izoh |
|---|---|
| 9:16 va 1:1 formatlar | Har bir format uchun kadr joylashuvi boshqacha — alohida build |
| Boshqa workflow'lar | faceless-explainer, motion-graphics, pr-to-video |
| LLM uchun API kalit | Obuna faqat shaxsiy sinov uchun; mahsulotda Anthropic API yoki Agent SDK |
| Ko'p foydalanuvchi | Navbat, har bir ish uchun konteyner-sandbox |
| Bulutda render | Lambda yoki Cloud Run (repoda tayyor) |
| Saqlash va CDN | S3 yoki R2 |
| Haqiqiy global to'lov | Stripe ko'rsatilgan davlatda ro'yxatdan o'tgan kompaniyani talab qiladi. Muqobili — merchant of record (Paddle, Lemon Squeezy). Qarorni keyin qabul qilamiz |
| Recipe (qayta ishlatish) | `recipe.mjs freeze` — "shu uslubda yana bitta" |
| Living video | Alohida mahsulot yo'nalishi |

---

## 11. Xavflar va noma'lumlar

| # | Xavf | Ta'siri | Chora |
|---|---|---|---|
| 1 | Headless agent kutilmaganda savol berib to'xtaydi | Pipeline tiqilib qoladi | Host shartnomasi + `NOVA_STATE` + F1 sinovi |
| 2 | Bitta video vaqti noma'lum | Mijoz kutishga chidamaydi | F1'da o'lchaymiz |
| 3 | Bitta video narxi noma'lum (oddiy "ok" ham $0.039) | Narx qo'yib bo'lmaydi | Har bir run'da `total_cost_usd` yoziladi |
| 4 | HeyGen bepul limiti noma'lum | Ovoz yarim yo'lda to'xtaydi | `auth status` oldin va keyin; zaxira — Kokoro |
| 5 | `HEYGEN_API_KEY` ENV'da qolib ketsa, OAuth'ni bosib o'tadi (balans 0) | Ovoz ishlamaydi | Worker ishga tushishdan oldin tekshiradi va ogohlantiradi |
| 6 | `bypassPermissions` + begona sayt matni = prompt injection xavfi (sizning kompyuteringizda) | Agent kutilmagan buyruq bajarishi mumkin | Avval `auto` rejimi; faqat ishonchli URL'lar; mahsulotda konteyner |
| 7 | Sayt capture'ni bloklaydi (bot himoyasi) | Qat'iy to'xtash | `capture/BLOCKED.md` matnini ko'rsatish, boshqa URL taklif qilish |
| 8 | `heygen` CLI Windows'da yo'q → `media-use` katalogidan rasm/ikonka qidiruvi ishlamaydi | Ba'zi asset'lar kamroq | TTS va BGM REST orqali ishlaydi; F1'da tekshiramiz |
| 9 | `node:sqlite` experimental, Turbopack bilan muammo chiqishi mumkin | Build xatosi | Zaxira: `better-sqlite3` |
| 10 | HyperFrames tez yangilanadi | Kutilmagan o'zgarishlar | `@0.8.46` pin; yangilash faqat ongli qaror bilan |
| 11 | `resume` bilan kontekst juda kattalashadi | Narx va sifat | `--autocompact`; kerak bo'lsa yangi sessiya + fayllardan davom ettirish (skill buni qo'llaydi) |

---

## 12. Xavfsizlik qoidalari

- Hech qanday API kalit repo'ga, `.env` fayllarga, loglarga yoki `BRIEF.md`'ga yozilmaydi.
- HeyGen kirish ma'lumotlari faqat `~/.heygen/credentials` da, `hyperframes auth login` orqali.
- Worker `job_events`'ga yozishdan oldin `sk_`, `Bearer ` kabi satrlarni yashiradi.
- Parollar `scrypt` bilan heshlanadi, sessiya cookie — `httpOnly`, `sameSite=lax`.
- `/api/jobs/[id]/files/...` faqat o'sha ish papkasi ichidagi fayllarni beradi (path traversal himoyasi).
- Prototip faqat `localhost`'da ishlaydi.

---

## 13. Tayyorlik mezonlari (butun prototip)

- [ ] F0–F8 har biri o'z mezoniga javob beradi
- [ ] Login'dan MP4'gacha oqimni **boshqa sayt** bilan ham takrorlash mumkin
- [ ] `spike/REPORT.md`'da vaqt va narx raqamlari bor
- [ ] Ish bekor qilinganda hech qanday "osilib qolgan" jarayon (Chrome, claude, node) qolmaydi
- [ ] Xato holatlarida (capture bloklangan, auth yo'q, agent `blocked`) foydalanuvchi tushunarli xabar ko'radi

---

## 14. Manbalar

**HyperFrames hujjatlari**
- [Introduction](https://hyperframes.heygen.com/introduction) · [llms.txt (hujjatlar indeksi)](https://hyperframes.heygen.com/llms.txt)
- [Product Launch Video guide](https://hyperframes.heygen.com/guides/product-launch-video)
- [Authentication & API Keys](https://hyperframes.heygen.com/guides/authentication)
- [Cloud Rendering](https://hyperframes.heygen.com/deploy/cloud)
- [Variables](https://hyperframes.heygen.com/concepts/variables)
- [Player package](https://hyperframes.heygen.com/packages/player)
- [SDK Quickstart](https://hyperframes.heygen.com/sdk/quickstart)
- [studio-server package](https://hyperframes.heygen.com/packages/studio-server)
- [Deploy templates (Vercel / Cloudflare / Modal)](https://hyperframes.heygen.com/guides/deploy)

**Repo**
- [heygen-com/hyperframes](https://github.com/heygen-com/hyperframes)
- [skills/product-launch-video/SKILL.md](https://github.com/heygen-com/hyperframes/blob/main/skills/product-launch-video/SKILL.md)

**Lokal skill hujjatlari** (`~/.claude/skills/`)
- `hyperframes/references/brief-format.md`, `brief-contract.md`, `review-loop.md`, `storyboard-format.md`, `production-loop.md`, `skill-lifecycle.md`
- `hyperframes-cli/references/preview-render.md`, `cloud.md`, `init-and-scaffold.md`
- `media-use/references/setup-providers.md`, `audio/scripts/lib/heygen.mjs`

**Boshqa**
- [HeyGen CLI](https://developers.heygen.com/cli) — Windows qo'llab-quvvatlanmaydi
- `claude --help` (2.1.273) va `claude -p … --output-format json` sinovi, 2026-09-17
