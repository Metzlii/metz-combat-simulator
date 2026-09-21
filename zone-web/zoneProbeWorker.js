import{burnN as e}from"./zoneProbe.js?v=d910b47a47eb";onmessage=n=>{const o=Number(n.data);e(o);const r=performance.now();e(o),postMessage(performance.now()-r)};
