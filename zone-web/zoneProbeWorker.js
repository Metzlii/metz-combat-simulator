import{burnN as e}from"./zoneProbe.js?v=2cf1a685a6d6";onmessage=n=>{const o=Number(n.data);e(o);const r=performance.now();e(o),postMessage(performance.now()-r)};
