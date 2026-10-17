// Browser side of local mode: the same method surface as zone-web/zoneClient.js's createBrowserZoneClient, but
// every call goes to local/server.mjs, which runs the kernel in Node worker threads.
const API = new URL("/local-api/", location.origin);

export async function localServerInfo() {
  if (!/^https?:$/.test(location.protocol)) return null;
  try {
    const r = await fetch(new URL("ping", API), { cache: "no-store", signal: AbortSignal.timeout(1500) });
    if (!r.ok) return null;
    const info = await r.json();
    return info?.ok ? info : null;
  } catch { return null; }
}

async function call(name, body) {
  const r = await fetch(new URL(name, API), {
    method: "POST", headers: { "content-type": "application/json" },
    body: body === undefined ? "" : JSON.stringify(body),
  });
  const out = await r.json().catch(() => ({ error: `local server: HTTP ${r.status}` }));
  if (out.error) throw new Error(out.error);
  return out.value;
}

// One streamed request. Events arrive as NDJSON lines; Stop asks the server to wind down, and the server still
// answers with the "done" summary, as the in-page client does.
function stream(method, body, { onHead, onRow, onStep } = {}) {
  const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  let aborted = false;
  const done = (async () => {
    const r = await fetch(new URL(`stream/${method}?id=${id}`, API), {
      method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body),
    });
    if (!r.ok || !r.body) throw new Error(`local server: HTTP ${r.status}`);
    const reader = r.body.pipeThrough(new TextDecoderStream()).getReader();
    let buf = "", result = null;
    const handle = text => {
      if (!text.trim()) return;
      const ev = JSON.parse(text);
      if (ev.kind === "head") onHead?.(ev);
      else if (ev.kind === "row") { if (!aborted) onRow?.(ev); }
      else if (ev.kind === "step") { if (!aborted) onStep?.(ev); }
      else if (ev.kind === "error") throw new Error(ev.error);
      else if (ev.kind === "done") result = ev;
    };
    for (;;) {
      const { value, done: end } = await reader.read();
      if (end) break;
      buf += value;
      let nl;
      while ((nl = buf.indexOf("\n")) >= 0) { handle(buf.slice(0, nl)); buf = buf.slice(nl + 1); }
    }
    handle(buf);
    return result || { kind: "done", ms: null, stopped: true };
  })();
  return {
    abort: () => { if (aborted) return; aborted = true; call("abort", { id }).catch(() => {}); },
    done,
  };
}

export function createLocalZoneClient(info) {
  let workers = info.workers, maxWorkers = info.maxWorkers;
  return {
    get maxWorkers() { return maxWorkers; },
    setMaxWorkers(n) { return maxWorkers; },   // the server knows the real core count; nothing to probe
    get workers() { return workers; },
    // Setup > Advanced > Workers. The server applies it; this returns the value the page asked for (clamped)
    // so the setting reads back immediately, then follows the server's answer.
    setWorkers(n) {
      workers = Math.max(1, Math.min(maxWorkers, Math.floor(Number(n)) || 1));
      call("setWorkers", { workers }).then(v => { workers = v.workers; }).catch(e => console.warn("setWorkers", e));
      return workers;
    },
    zones: () => call("zones"),
    zoneImport: p => call("zoneImport", p),
    zoneCatalog: () => call("zoneCatalog"),
    zoneDerive: b => call("zoneDerive", b),
    zoneRun: b => call("zoneRun", b),
    zoneLimits: () => call("zoneLimits"),
    zoneMarket: () => call("zoneMarket"),
    zoneMarketRefresh: () => call("zoneMarketRefresh"),
    zoneRunStream: (b, h) => stream("run", b, h),
    zoneUpgrades: b => call("zoneUpgrades", b),
    zoneUpgradeCount: b => call("zoneUpgradeCount", b),
    zoneUpgradesStream: (b, h) => stream("upgrades", b, h),
    zoneTriggers: b => call("zoneTriggers", b),
    zoneTriggersStream: (b, h) => stream("triggers", b, h),
    zoneSkills: b => call("zoneSkills", b),
    zoneSkillsStream: (b, h) => stream("skills", b, h),
    close() {},
  };
}
