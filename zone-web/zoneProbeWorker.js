import{burnN as e}from"./zoneProbe.js?v=d10fe2dc4912";onmessage=n=>{const o=Number(n.data);e(o);const r=performance.now();e(o),postMessage(performance.now()-r)};
