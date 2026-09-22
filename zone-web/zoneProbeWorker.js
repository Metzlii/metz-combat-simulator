import{burnN as e}from"./zoneProbe.js?v=f5d70b11a40c";onmessage=n=>{const o=Number(n.data);e(o);const r=performance.now();e(o),postMessage(performance.now()-r)};
