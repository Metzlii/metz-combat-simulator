import{burnN as e}from"./zoneProbe.js?v=7ec2104c9c6f";onmessage=n=>{const o=Number(n.data);e(o);const r=performance.now();e(o),postMessage(performance.now()-r)};
