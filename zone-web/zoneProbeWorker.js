import{burnN as e}from"./zoneProbe.js?v=2bd2c62c3d06";onmessage=n=>{const o=Number(n.data);e(o);const r=performance.now();e(o),postMessage(performance.now()-r)};
