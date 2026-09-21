import{burnN as e}from"./zoneProbe.js?v=300bc9ab2b6d";onmessage=n=>{const o=Number(n.data);e(o);const r=performance.now();e(o),postMessage(performance.now()-r)};
