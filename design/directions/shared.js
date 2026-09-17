// Shared mock data for the three design directions (Storyboard screen, awaiting_approval).
// Content is a stand-in until the F1 spike produces the real STORYBOARD.md for cap.so.

window.NOVA = {
  project: { name: "Cap — launch video", url: "cap.so", length: "43s", voice: "Female · English", preset: "Auto → capsule" },
  message: "Beautiful screen recordings, shared in seconds.",
  arc: "Hook → Problem → Solution → Feature → Proof → Call to action",
  palette: [
    { name: "Ink", hex: "#101218" },
    { name: "Paper", hex: "#F7F7F8" },
    { name: "Cap Blue", hex: "#4F7CFF" },
    { name: "Mist", hex: "#C9D3E6" },
  ],
  steps: ["Setup", "Capture", "Design", "Storyboard", "Build", "Render"],
  current: 3,
  frames: [
    { id: "01", role: "Hook", title: "Your next demo shouldn't take a day", scene: "Black screen, a cursor blinks, the headline types itself out word by word.", vo: "Recording a product demo shouldn't eat your whole afternoon.", dur: 5, layout: "type" },
    { id: "02", role: "Problem", title: "Slow tools, heavy files, closed platforms", scene: "Three cluttered recorder windows stack up and blur into grey.", vo: "Most screen recorders are slow, bloated, and lock your videos away.", dur: 7, layout: "stack" },
    { id: "03", role: "Solution", title: "Meet Cap", scene: "The windows collapse into the Cap logo on a clean canvas.", vo: "Meet Cap — the open-source way to record, edit, and share your screen.", dur: 8, layout: "logo" },
    { id: "04", role: "Feature", title: "Stop recording — the link is ready", scene: "Captured site screenshot; the share link copies itself as recording ends.", vo: "Hit stop, and your link is already on the clipboard.", dur: 9, layout: "ui" },
    { id: "05", role: "Proof", title: "Open source. Your recordings, your storage.", scene: "Code panel and a storage toggle slide in side by side.", vo: "It's open source, and you choose where every recording lives.", dur: 8, layout: "split" },
    { id: "06", role: "Call to action", title: "Start recording free", scene: "Logo, URL cap.so, and a single button pulse once.", vo: "Start recording for free at cap.so.", dur: 6, layout: "cta" },
  ],
};

// A tiny scaled "frame" drawn with CSS — stands in for the real contact-sheet thumbnail.
window.novaThumb = function (f) {
  const inner = {
    type: `<div class="t-type"><span>${f.title}<i></i></span></div>`,
    stack: `<div class="t-stack"><b></b><b></b><b></b></div>`,
    logo: `<div class="t-logo"><em></em><span>Cap</span></div>`,
    ui: `<div class="t-ui"><div class="t-win"><s></s><s></s><s></s></div><div class="t-pill">cap.link/x7 ✓ copied</div></div>`,
    split: `<div class="t-split"><div class="t-code"><s></s><s></s><s></s><s></s></div><div class="t-toggle"><em></em></div></div>`,
    cta: `<div class="t-cta"><em></em><span>cap.so</span><b>Start free</b></div>`,
  }[f.layout];
  return `<div class="thumb thumb--${f.layout}">${inner}</div>`;
};

window.novaFmt = (s) => `0:${String(s).padStart(2, "0")}`;
window.novaStart = (i) => NOVA.frames.slice(0, i).reduce((a, f) => a + f.dur, 0);

// Floating switcher between the three directions.
document.addEventListener("DOMContentLoaded", () => {
  const here = location.pathname.split("/").pop().replace(/(\.html)?$/, ".html");
  const links = [["a-paper.html", "A · Paper"], ["b-studio.html", "B · Studio"], ["c-canvas.html", "C · Canvas"]];
  const nav = document.createElement("nav");
  nav.className = "dir-switch";
  nav.innerHTML = `<a href="index.html">All</a>` + links.map(([h, l]) => `<a href="${h}" class="${h === here ? "on" : ""}">${l}</a>`).join("");
  document.body.appendChild(nav);
});
