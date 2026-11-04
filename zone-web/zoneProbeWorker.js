import{burnN as e}from"./zoneProbe.js?v=3fb6b9525d3e";onmessage=n=>{const o=Number(n.data);e(o);const r=performance.now();e(o),postMessage(performance.now()-r)};
