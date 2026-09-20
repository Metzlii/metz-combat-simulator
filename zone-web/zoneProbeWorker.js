import{burnN as e}from"./zoneProbe.js?v=d037e6b2a84d";onmessage=n=>{const o=Number(n.data);e(o);const r=performance.now();e(o),postMessage(performance.now()-r)};
