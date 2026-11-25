import{burnN as e}from"./zoneProbe.js?v=7e1991d3fd1d";onmessage=n=>{const o=Number(n.data);e(o);const r=performance.now();e(o),postMessage(performance.now()-r)};
