import{burnN as e}from"./zoneProbe.js?v=06f65e4009cd";onmessage=n=>{const o=Number(n.data);e(o);const r=performance.now();e(o),postMessage(performance.now()-r)};
