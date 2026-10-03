import{burnN as e}from"./zoneProbe.js?v=7e36c569d8d5";onmessage=n=>{const o=Number(n.data);e(o);const r=performance.now();e(o),postMessage(performance.now()-r)};
