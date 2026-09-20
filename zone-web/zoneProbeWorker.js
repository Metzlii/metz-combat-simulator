import{burnN as e}from"./zoneProbe.js?v=05d5bbe10e42";onmessage=n=>{const o=Number(n.data);e(o);const r=performance.now();e(o),postMessage(performance.now()-r)};
