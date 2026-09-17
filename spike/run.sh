#!/usr/bin/env bash
# F1 spike: plan -> build -> render, headless, no UI. Logs to the job's logs/ folder.
JOB=/c/Users/joray/nova-one-data/jobs/spike-cap
PROJ=$JOB/videos/cap-promo
CONTRACT=/c/Users/joray/nova-one/worker/host-contract.md
MODE=${MODE:-auto}
T=$JOB/logs/timings.txt
cd "$JOB"

npx -y hyperframes@0.8.46 auth status > logs/auth-before.txt 2>&1

run() { # kind budget prompt [resume]
  local kind=$1 budget=$2 prompt=$3 resume=$4
  local start=$(date +%s)
  echo "$kind start $(date -Iseconds)" >> "$T"
  claude -p "$prompt" ${resume:+--resume "$resume"} \
    --output-format stream-json --verbose \
    --append-system-prompt "$(cat "$CONTRACT")" \
    --permission-mode "$MODE" --max-budget-usd "$budget" \
    > "logs/run-$kind.jsonl" 2> "logs/run-$kind.stderr.txt"
  echo "$kind exit=$? seconds=$(( $(date +%s) - start ))" >> "$T"
}
field() { node -e '
  const L=require("fs").readFileSync(process.argv[1],"utf8").trim().split(/\n/).map(l=>{try{return JSON.parse(l)}catch{return null}}).filter(Boolean);
  const r=L.filter(x=>x.type==="result").pop()||{}; const k=process.argv[2];
  console.log(k==="state" ? ((r.result||"").trim().split(/\n/).pop()) : (r[k] ?? ""));' "$1" "$2"; }

run plan 25 "Use the product-launch-video skill. The project already exists at videos/cap-promo and BRIEF.md there is confirmed. Source URL: https://cap.so/home. Run Step 0 through Step 3 and stop at the plan checkpoint."
SID=$(field logs/run-plan.jsonl session_id); echo "plan state: $(field logs/run-plan.jsonl state)" >> "$T"
[ -f "$PROJ/STORYBOARD.md" ] || { echo "STOP: no STORYBOARD.md" >> "$T"; exit 1; }

run build 80 "The plan is approved. Skip the sketch pass and build in one go. Run Step 3.1 through the Step 6 checks and stop at the final-look question." "$SID"
echo "build state: $(field logs/run-build.jsonl state)" >> "$T"
ls "$PROJ"/compositions/frames/*.html >/dev/null 2>&1 || { echo "STOP: index.html not assembled" >> "$T"; exit 1; }

start=$(date +%s); echo "render start $(date -Iseconds)" >> "$T"
( cd "$PROJ" && npx -y hyperframes@0.8.46 render --skill=product-launch-video --quality high --output renders/video.mp4 ) > logs/render.log 2>&1
echo "render exit=$? seconds=$(( $(date +%s) - start ))" >> "$T"
npx -y hyperframes@0.8.46 auth status > logs/auth-after.txt 2>&1
echo "DONE $(date -Iseconds)" >> "$T"
