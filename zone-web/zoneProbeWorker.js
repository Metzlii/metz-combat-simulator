import{burnN as e}from"./zoneProbe.js?v=b80d0f63e1d4";onmessage=n=>{const o=Number(n.data);e(o);const r=performance.now();e(o),postMessage(performance.now()-r)};
