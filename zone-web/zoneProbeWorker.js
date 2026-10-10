import{burnN as e}from"./zoneProbe.js?v=b8df501ecacc";onmessage=n=>{const o=Number(n.data);e(o);const r=performance.now();e(o),postMessage(performance.now()-r)};
