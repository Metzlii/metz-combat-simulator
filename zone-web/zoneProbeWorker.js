import{burnN as e}from"./zoneProbe.js?v=bc3f77b75fbd";onmessage=n=>{const o=Number(n.data);e(o);const r=performance.now();e(o),postMessage(performance.now()-r)};
