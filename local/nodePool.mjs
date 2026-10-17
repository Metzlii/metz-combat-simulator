// A worker_threads pool with the same shape as the browser's createWasmPool (zone-web/zoneClient.js):
// { size, run(job), resize(n), close() }. Each thread instantiates the kernel wasm once and runs jobs on it.
// `onJob` (optional) hears about every finished job, for local/metrics.mjs; `stats()` is the pool's live state.
import { Worker } from "node:worker_threads";
import { performance } from "node:perf_hooks";

const WORKER_URL = new URL("./nodeWorker.mjs", import.meta.url);

export function createNodePool(size, { onJob = null } = {}) {
  const all = [], idle = [], queue = [], pending = new Map();
  let nextId = 1, target = Math.max(1, Math.floor(size) || 1);

  const spawn = () => {
    const w = new Worker(WORKER_URL);
    w.on("message", ({ id, resultJson, error, runMs }) => {
      const p = pending.get(id); pending.delete(id);
      if (all.length > target) retire(w); else idle.push(w);
      let result = null;
      if (!error) { try { result = JSON.parse(resultJson); } catch (e) { error = `bad kernel output: ${e.message}`; } }
      if (onJob) {
        try { onJob({ ok: !error, result, job: p.job, runMs, queuedMs: p.startedAt - p.queuedAt, workerId: w.threadId }); }
        catch { /* metrics never break a run */ }
      }
      error ? p.reject(new Error(error)) : p.resolve(result);
      pump();
    });
    w.on("error", e => {
      for (const [id, p] of pending) if (p.worker === w) { pending.delete(id); p.reject(e); }
      retire(w);
      while (all.length < target) { const n = spawn(); all.push(n); idle.push(n); }
      pump();
    });
    w.unref();
    return w;
  };
  const retire = w => { w.terminate(); const i = all.indexOf(w); if (i >= 0) all.splice(i, 1); const j = idle.indexOf(w); if (j >= 0) idle.splice(j, 1); };
  const pump = () => {
    while (queue.length && idle.length) {
      const w = idle.pop(), { id, jobJson } = queue.shift(), p = pending.get(id);
      p.worker = w; p.startedAt = performance.now();
      w.ref(); w.postMessage({ id, jobJson });
    }
    for (const w of idle) w.unref();
  };
  for (let i = 0; i < target; i++) { const w = spawn(); all.push(w); idle.push(w); }

  return {
    get size() { return target; },
    run(job) {
      return new Promise((resolve, reject) => {
        const id = nextId++;
        pending.set(id, { resolve, reject, job, queuedAt: performance.now() });
        queue.push({ id, jobJson: JSON.stringify(job) });
        pump();
      });
    },
    resize(n) {
      target = Math.max(1, Math.floor(Number(n)) || 1);
      while (all.length < target) { const w = spawn(); all.push(w); idle.push(w); }
      while (all.length > target && idle.length) retire(idle.pop());
      pump();
    },
    stats() {
      return { size: target, threads: all.length, busy: all.length - idle.length, queued: queue.length, workers: all.slice() };
    },
    close() { all.slice().forEach(retire); },
  };
}
