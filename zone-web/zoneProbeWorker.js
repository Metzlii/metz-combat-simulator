import{burnN as e}from"./zoneProbe.js?v=24c3cb0ecf4b";onmessage=n=>{const o=Number(n.data);e(o);const r=performance.now();e(o),postMessage(performance.now()-r)};
