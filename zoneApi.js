// The zone client, alone. This module is what the public zone document (Zones.dc.html) loads, so it carries
// nothing else: no guild endpoints, no demo dataset, no static import of mockServer.js — only the dynamic
// import of the browser zone client. api.js re-exports connectZoneOnly from here, so the full application's
// single import of api.js still reaches it and the zone wiring lives in one place.
//
// No server and no demo fallback: the seven zone methods are answered in the page by the same modules the job
// server's /zone-sim/* routes run (zone-web/zoneClient.js), with the kernel as wasm in Web Workers. The zone
// tab needs nothing else, so this client carries only those methods, and a zone feature added to the
// server's modules reaches the page with the next site build.
export async function connectZoneOnly() {
  const { createBrowserZoneClient } = await import("./zone-web/zoneClient.js");
  const zone = await createBrowserZoneClient();
  // The visitor's own lane count (every core but one) stands in for the server's worker pool.
  let lanes = null;
  try { lanes = Number((await zone.zoneLimits())?.concurrency) || null; } catch (e) { console.warn("zone limits unavailable", e); }
  return {
    source: "browser", workers: lanes || 1, zoneLanes: lanes, base: null, data: {},
    subscribe() { return () => {}; },
    zones: () => zone.zones(),
    zoneImport: payload => zone.zoneImport(payload),
    zoneCatalog: () => zone.zoneCatalog(),
    zoneDerive: body => zone.zoneDerive(body),
    zoneRun: body => zone.zoneRun(body),
    zoneLimits: () => zone.zoneLimits(),
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
}
