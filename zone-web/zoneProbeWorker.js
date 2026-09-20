import{burnN as e}from"./zoneProbe.js?v=b72e7a518ca1";onmessage=n=>{const o=Number(n.data);e(o);const r=performance.now();e(o),postMessage(performance.now()-r)};
