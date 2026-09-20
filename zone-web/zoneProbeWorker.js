import{burnN as e}from"./zoneProbe.js?v=c8b21f21434e";onmessage=n=>{const o=Number(n.data);e(o);const r=performance.now();e(o),postMessage(performance.now()-r)};
