import{burnN as e}from"./zoneProbe.js?v=d8b39e8da4ae";onmessage=n=>{const o=Number(n.data);e(o);const r=performance.now();e(o),postMessage(performance.now()-r)};
