// The site in the reader's own language (ZONE-96, operator 2026-09-21: "specifically Chinese, but the more we
// can support the better").
//
// THE ENGLISH IS THE KEY. `locales/zh.json` maps an English string to its translation, so there is no key
// scheme to invent or keep in step, a string the file has not reached falls back to the English it was keyed
// by, and a half-finished translation is always safe to ship. Anyone can correct one line without reading any
// code.
//
// Two ways in, because the page makes text two ways:
//
//   - Markup literals. The component runtime renders a `{{ value }}` inside `<span class="sc-interp">` and
//     leaves literal markup text as a bare text node -- so a pass over the DOM can translate every label and
//     paragraph while PROVABLY never touching a number, a player's name or an item. That is what makes this
//     worth doing without editing two thousand lines of markup.
//   - Strings a component builds. Those arrive inside `sc-interp` along with the data, indistinguishable from
//     it, so they are translated at the source with `t("...")` where the author knows which is which.
//
// Nothing internal is translated: hrids, keys, stored state and every number stay exactly as they are. Only
// what a person reads changes.
const STORE = "mwi.zone.lang";

// A language is listed here once its file exists. `native` is what the language calls ITSELF, because a reader
// looking for their own language is not helped by its English name.
export const LANGUAGES = [
  { code: "en", native: "English" },
  { code: "zh", native: "中文" },
];

let dict = Object.create(null);
let lang = "en";

/** The saved choice, else the browser's own language, else English. `zh-CN`, `zh-TW` and `zh` all mean zh. */
export function preferred() {
  try {
    const saved = localStorage.getItem(STORE);
    if (saved && LANGUAGES.some(l => l.code === saved)) return saved;
  } catch {}
  const tags = (globalThis.navigator?.languages?.length ? navigator.languages : [globalThis.navigator?.language])
    .filter(Boolean).map(String);
  for (const tag of tags) {
    const base = tag.toLowerCase().split("-")[0];
    const hit = LANGUAGES.find(l => l.code === base);
    if (hit) return hit.code;
  }
  return "en";
}

export const current = () => lang;

/** The translation of `s`, or `s` itself. Safe before a locale has loaded, and safe for a string nobody translated. */
export function t(s) {
  const v = dict[s];
  return typeof v === "string" && v ? v : s;
}

/** Load a locale and apply it. English is the source, so it needs no file. */
export async function setLanguage(code) {
  const next = LANGUAGES.some(l => l.code === code) ? code : "en";
  if (next === "en") { dict = Object.create(null); }
  else {
    try {
      const v = globalThis.__siteVersion;
      const res = await fetch(`locales/${next}.json${v ? `?v=${v}` : ""}`);
      dict = res.ok ? await res.json() : Object.create(null);
    } catch { dict = Object.create(null); }
  }
  lang = next;
  try { localStorage.setItem(STORE, next); } catch {}
  document.documentElement.setAttribute("lang", next);
  restore();
  translate(document.body);
  globalThis.dispatchEvent?.(new CustomEvent("zone-language", { detail: { lang: next } }));
  return next;
}

// What each node said in English before it was translated. Switching back has to put the English BACK, and the
// dictionary only runs one way; a reverse lookup would also collide wherever two English strings share one
// translation. React replacing a node simply drops it from here, which is correct -- what React wrote is
// English again.
const original = new WeakMap();
const originalAttr = new WeakMap();
const ATTRS = ["title", "placeholder", "aria-label", "alt"];

function restore() {
  const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n = walk.nextNode(); n; n = walk.nextNode()) {
    const was = original.get(n);
    if (was !== undefined) { n.nodeValue = was; original.delete(n); }
  }
  for (const el of document.body.querySelectorAll("*")) {
    const was = originalAttr.get(el);
    if (!was) continue;
    for (const [a, v] of Object.entries(was)) el.setAttribute(a, v);
    originalAttr.delete(el);
  }
}

/** Translate every literal in `root`. A value inside `.sc-interp` is data and is never touched. */
export function translate(root = document.body) {
  if (lang === "en" || !root) return;
  const walk = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(n) {
      const p = n.parentElement;
      if (!p || p.closest("script,style,textarea")) return NodeFilter.FILTER_REJECT;
      // The runtime's own marker for "this came from a {{ }}": a number, a name, an item -- never a label.
      if (p.closest(".sc-interp")) return NodeFilter.FILTER_REJECT;
      return n.nodeValue && n.nodeValue.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    },
  });
  const nodes = [];
  for (let n = walk.nextNode(); n; n = walk.nextNode()) nodes.push(n);
  for (const n of nodes) {
    const raw = n.nodeValue, key = raw.trim();
    const hit = dict[key];
    if (!hit || hit === key) continue;
    // The surrounding whitespace is layout, not text: "Seed " keeps its space.
    if (!original.has(n)) original.set(n, raw);
    n.nodeValue = raw.replace(key, hit);
  }
  for (const el of root.querySelectorAll ? root.querySelectorAll("*") : []) {
    for (const a of ATTRS) {
      const v = el.getAttribute?.(a);
      const hit = v && dict[v.trim()];
      if (!hit || hit === v.trim()) continue;
      const was = originalAttr.get(el) || {};
      if (!(a in was)) { was[a] = v; originalAttr.set(el, was); }
      el.setAttribute(a, hit);
    }
  }
}

/**
 * Keep translating as the page re-renders.
 *
 * React writes English every time it re-renders a node, so this cannot be a one-off. A second pass over text
 * that is already translated finds Chinese, which is not a key, and changes nothing -- so the observer settles
 * after one extra pass instead of looping.
 */
export function watch() {
  if (!globalThis.MutationObserver) return;
  let queued = false;
  const run = () => translate(document.body);
  // Two separate faults lived here. `(globalThis.requestAnimationFrame || setTimeout)(run)` throws "Illegal
  // invocation" -- a native method called detached from `window` has no receiver -- and rAF does not fire in a
  // hidden tab either way. Both ended the same: the first mutation set `queued` and nothing ever cleared it, so
  // the About tab stayed entirely English while the tabs above it were Chinese.
  // A timer, NOT requestAnimationFrame. rAF does not fire in a hidden or background tab, so a page rendered
  // while the tab was in the background stayed English until something brought it forward -- and the queue flag
  // sat true the whole time. Swapping text is not animation and has no reason to wait for a paint.
  const soon = (fn) => setTimeout(fn, 0);
  new MutationObserver(() => {
    if (queued || lang === "en") return;
    queued = true;
    // And it cannot be allowed to wedge again: whatever happens, `queued` is released.
    soon(() => { try { run(); } finally { queued = false; } });
  }).observe(document.body, { childList: true, characterData: true, subtree: true });
}

/** Pick a language, load it, and keep it applied. Called once, as early as the page can. */
export async function start() {
  await setLanguage(preferred());
  watch();
  return lang;
}
