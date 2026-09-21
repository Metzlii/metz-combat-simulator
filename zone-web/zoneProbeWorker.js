import{burnN as e}from"./zoneProbe.js?v=b57d7f74de42";onmessage=n=>{const o=Number(n.data);e(o);const r=performance.now();e(o),postMessage(performance.now()-r)};
