import{burnN as e}from"./zoneProbe.js?v=c49b04510c3f";onmessage=n=>{const o=Number(n.data);e(o);const r=performance.now();e(o),postMessage(performance.now()-r)};
