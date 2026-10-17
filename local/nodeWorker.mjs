import { parentPort } from "node:worker_threads";
import { readFileSync } from "node:fs";
import { performance } from "node:perf_hooks";
import { initSync, simulate } from "../kernel-zone/wasm/pkg/mwi_zone_wasm.js";

initSync({ module: readFileSync(new URL("../kernel-zone/wasm/pkg/mwi_zone_wasm_bg.wasm", import.meta.url)) });

parentPort.on("message", ({ id, jobJson }) => {
  const t0 = performance.now();
  try { const resultJson = simulate(jobJson); parentPort.postMessage({ id, resultJson, runMs: performance.now() - t0 }); }
  catch (e) { parentPort.postMessage({ id, error: String(e?.message || e), runMs: performance.now() - t0 }); }
});
