// The zone client, alone. This module is what the public zone document (Zones.dc.html) loads, so it carries
// nothing else: no guild endpoints, no demo dataset, no static import of mockServer.js — only the dynamic
// import of the browser zone client. api.js re-exports connectZoneOnly from here, so the full application's
// single import of api.js still reaches it and the zone wiring lives in one place.
//
// No server and no demo fallback: the seven zone methods are answered in the page by the same modules the job
// server's /zone-sim/* routes run (zone-web/zoneClient.js), with the kernel as wasm in Web Workers. The zone
// tab needs nothing else, so this client carries only those methods, and a zone feature added to the
// server's modules reaches the page with the next site build.

// The visitor's Workers setting (Setup > Advanced), kept in this browser. Absent: every core but one.
const WORKERS_KEY = "mwi.zone.workers";
const savedWorkers = () => { try { const v = Number(localStorage.getItem(WORKERS_KEY)); return v >= 1 ? Math.floor(v) : null; } catch { return null; } };

export async function connectZoneOnly() {
  const { createBrowserZoneClient } = await import("./zone-web/zoneClient.js?v=18752681753a");
  let cores = Math.max(1, globalThis.navigator?.hardwareConcurrency || 2);
  const zone = await createBrowserZoneClient({ workers: Math.min(cores, savedWorkers() || Math.max(1, cores - 1)), maxWorkers: cores });
  // The visitor's own lane count (every core but one) stands in for the server's worker pool.
  let lanes = null;
  try { lanes = Number((await zone.zoneLimits())?.concurrency) || null; } catch (e) { console.warn("zone limits unavailable", e); }
  const client = {
    source: "browser", workers: lanes || 1, zoneLanes: lanes, base: null, data: {},
    // Setup > Advanced > Workers. `defaultWorkers` is what an unset field means; the header's lane count follows.
    maxWorkers: zone.maxWorkers, defaultWorkers: Math.max(1, cores - 1), savedWorkers: savedWorkers(),
    setZoneWorkers(n) {
      const w = zone.setWorkers(n == null || n === "" ? Math.max(1, cores - 1) : n);   // empty: back to the default
      try { if (n == null || n === "") localStorage.removeItem(WORKERS_KEY); else localStorage.setItem(WORKERS_KEY, String(w)); } catch { /* not kept */ }
      client.workers = client.zoneLanes = w; client.savedWorkers = savedWorkers();
      globalThis.dispatchEvent?.(new CustomEvent("zone-lanes", { detail: w }));
      return w;
    },
    subscribe() { return () => {}; },
    zones: () => zone.zones(),
    zoneImport: payload => zone.zoneImport(payload),
    zoneCatalog: () => zone.zoneCatalog(),
    zoneDerive: body => zone.zoneDerive(body),
    zoneRun: body => zone.zoneRun(body),
    zoneLimits: () => zone.zoneLimits(),
    zoneMarket: () => zone.zoneMarket(),
    zoneMarketRefresh: () => zone.zoneMarketRefresh(),
    zoneRunStream: (body, handlers) => zone.zoneRunStream(body, handlers),
    // ZONE-53 (1): the upgrade finder, passed through exactly as the rest are. Streamed is the form the page
    // uses — a search runs for minutes to hours, and the ranking fills in as rows land.
    zoneUpgrades: body => zone.zoneUpgrades(body),
    zoneUpgradesStream: (body, handlers) => zone.zoneUpgradesStream(body, handlers),
    // ZONE-53 (2) and (3): the other two optimizers. Same streamed shape as the upgrade finder.
    zoneTriggers: body => zone.zoneTriggers(body),
    zoneTriggersStream: (body, handlers) => zone.zoneTriggersStream(body, handlers),
    zoneSkills: body => zone.zoneSkills(body),
    zoneSkillsStream: (body, handlers) => zone.zoneSkillsStream(body, handlers),
    close: () => zone.close(),
  };

  // Firefox's fingerprinting protection under-reports navigator.hardwareConcurrency (4 on a 16-core machine,
  // bug 1630089), and Chrome can too; no API gives a page its machine's real core count. zoneProbe measures it
  // (from Star, 2026-09-19): how many lanes run the same CPU burn in parallel without slowing down, floored at
  // the browser's own report, so it can only ever RAISE the budget. It runs in the background -- the page is
  // usable immediately on the reported figure -- and when it finishes the ceiling, the default and the pool
  // follow, with the header's lane count updated through the same event the Workers setting uses.
  (async () => {
    try {
      const { probeLanes } = await import("./zone-web/zoneProbe.js?v=18752681753a");
      const measured = Math.max(1, await probeLanes());
      if (measured <= cores) return;
      cores = measured;
      zone.setMaxWorkers(cores);
      client.maxWorkers = cores;
      client.defaultWorkers = Math.max(1, cores - 1);
      if (savedWorkers() == null) client.setZoneWorkers(null);   // no saved choice: take the wider default
      else globalThis.dispatchEvent?.(new CustomEvent("zone-lanes", { detail: client.workers }));
    } catch (e) { console.warn("core probe unavailable", e); }
  })();

  return client;
}
