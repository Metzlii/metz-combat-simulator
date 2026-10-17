// A fixed, reproducible workload: the demo party's first character, solo, on every planet at tier 0.
//
//   node local/bench.mjs [--hours 24] [--workers 1,2,4,8,16] [--repeat 1]
//
// prints how throughput scales with the worker count. The server's dashboard runs the same workload
// (its "Run load test" button) through runWorkload().
import { readFileSync } from "node:fs";
import { availableParallelism } from "node:os";
import { fileURLToPath } from "node:url";

const DEMO = new URL("../demo-party.json", import.meta.url);

export async function buildWorkload(zone, { hours = 24, repeat = 1 } = {}) {
  const imp = await zone.zoneImport({ text: readFileSync(DEMO, "utf8") });
  const planets = (await zone.zones()).filter(z => !z.isDungeon);
  const candidates = Array.from({ length: repeat }, () => planets.map(z => ({ zone: z.hrid, difficultyTier: 0 }))).flat();
  return { players: imp.players.slice(0, 1), hours, candidates };
}

const MAX_PER_REQUEST = 200;   // server/zoneSim.mjs's candidate limit

export async function runWorkload(zone, body) {
  // Bigger workloads go in as several requests at once; they share the pool, so it stays saturated.
  const chunks = [];
  for (let i = 0; i < body.candidates.length; i += MAX_PER_REQUEST) chunks.push({ ...body, candidates: body.candidates.slice(i, i + MAX_PER_REQUEST) });
  const t0 = performance.now();
  const all = (await Promise.all(chunks.map(c => zone.zoneRun(c)))).flatMap(r => r.candidates);
  const wallMs = performance.now() - t0;
  const ok = all.filter(c => c.ok);
  const simHours = ok.reduce((a, c) => a + (c.simulatedHours || 0), 0);
  const kernelMs = ok.reduce((a, c) => a + (Number(c.workerMs) || 0), 0);
  return {
    sims: ok.length, failed: all.length - ok.length, wallMs, simHours,
    simHoursPerSec: simHours / (wallMs / 1000),
    simsPerSec: ok.length / (wallMs / 1000),
    msPerSimHour: kernelMs / simHours,   // kernel time per simulated hour, averaged over the jobs
  };
}

async function main() {
  const args = process.argv.slice(2);
  const opt = (n, d) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : d; };
  const cores = availableParallelism();
  const hours = Number(opt("hours", 24));
  const repeat = Math.max(1, Number(opt("repeat", 1)));
  const steps = opt("workers", null)?.split(",").map(Number).filter(n => n > 0)
    ?? [...new Set([1, 2, 4, 8, 12, 16, 24, 32, 48, 64].filter(n => n < cores).concat(cores))];

  const { createNodeZoneClient } = await import("./nodeZoneClient.mjs");
  const zone = createNodeZoneClient({ workers: Math.max(...steps), maxWorkers: Math.max(cores, ...steps) });
  const body = await buildWorkload(zone, { hours, repeat });
  console.log(`workload: ${body.candidates.length} planet sims x ${hours} h, solo · ${cores} logical cores · Node ${process.version}`);
  process.stdout.write("warm-up… ");
  await runWorkload(zone, body);
  console.log("done\n");

  console.log("workers   wall s   sims/s   sim-h/s   kernel ms/sim-h   speedup   efficiency");
  let base = null;
  for (const n of steps) {
    zone.setWorkers(n);
    const r = await runWorkload(zone, body);
    base ??= r.simHoursPerSec / n;
    const speedup = r.simHoursPerSec / base;
    console.log(
      `${String(n).padStart(7)}  ${(r.wallMs / 1000).toFixed(2).padStart(7)}  ${r.simsPerSec.toFixed(1).padStart(7)}  ${r.simHoursPerSec.toFixed(0).padStart(8)}` +
      `  ${r.msPerSimHour.toFixed(2).padStart(16)}  ${speedup.toFixed(2).padStart(7)}x  ${(100 * speedup / n).toFixed(0).padStart(9)}%`);
  }
  zone.close();
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main().catch(e => { console.error(e); process.exit(1); });
