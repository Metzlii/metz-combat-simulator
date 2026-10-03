import{burnN as e}from"./zoneProbe.js?v=5dd4c959db09";onmessage=n=>{const o=Number(n.data);e(o);const r=performance.now();e(o),postMessage(performance.now()-r)};
