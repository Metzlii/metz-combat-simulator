import{burnN as e}from"./zoneProbe.js?v=d5555a2f0ba3";onmessage=n=>{const o=Number(n.data);e(o);const r=performance.now();e(o),postMessage(performance.now()-r)};
