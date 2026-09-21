import{burnN as e}from"./zoneProbe.js?v=dac5782d2800";onmessage=n=>{const o=Number(n.data);e(o);const r=performance.now();e(o),postMessage(performance.now()-r)};
