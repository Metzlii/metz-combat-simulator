import{burnN as e}from"./zoneProbe.js?v=440aafad2d4d";onmessage=n=>{const o=Number(n.data);e(o);const r=performance.now();e(o),postMessage(performance.now()-r)};
