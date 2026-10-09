import{burnN as e}from"./zoneProbe.js?v=f5d8e898c5d9";onmessage=n=>{const o=Number(n.data);e(o);const r=performance.now();e(o),postMessage(performance.now()-r)};
