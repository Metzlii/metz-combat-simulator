import{burnN as e}from"./zoneProbe.js?v=7d1b9e75f6bb";onmessage=n=>{const o=Number(n.data);e(o);const r=performance.now();e(o),postMessage(performance.now()-r)};
