import{burnN as e}from"./zoneProbe.js?v=0240ab05134e";onmessage=n=>{const o=Number(n.data);e(o);const r=performance.now();e(o),postMessage(performance.now()-r)};
