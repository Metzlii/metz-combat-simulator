import{burnN as e}from"./zoneProbe.js?v=21cb2d9555db";onmessage=n=>{const o=Number(n.data);e(o);const r=performance.now();e(o),postMessage(performance.now()-r)};
