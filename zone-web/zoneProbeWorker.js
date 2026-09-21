import{burnN as e}from"./zoneProbe.js?v=2d245b50f1a2";onmessage=n=>{const o=Number(n.data);e(o);const r=performance.now();e(o),postMessage(performance.now()-r)};
