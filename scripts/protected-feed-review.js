import { readFileSync,writeFileSync,mkdirSync } from 'node:fs';
import { firstTable } from '../src/table.js';
import { searchTimings,searchNudges,runShot } from '../src/shot-lab.js';
const before=JSON.parse(readFileSync(new URL('../scenarios/layout-before-protected-feeds.json',import.meta.url),'utf8'));
const reports=[],summary=[];
for(const [revision,table] of [['before',before],['after',firstTable]]){
  const rows=[];
  for(const [side,positions] of [['left',[1.5,1.7,1.9]],['right',[4.1,4.2,4.25]]])for(const x of positions)for(const vx of [-.4,0,.4])for(const vy of [.5,2]){
    const spec={name:`${side} x=${x} vx=${vx} vy=${vy}`,table,initial:{x,y:7.6,vx,vy},ticks:1200,target:{x:1,y:6.1,width:3.8,height:.15}};
    const timings=searchTimings(spec,{side,delays:Array.from({length:13},(_,i)=>i*8),holdTicks:24});
    const nudges=searchNudges({...spec,ticks:600},{input:{[side]:true},delays:[0,12,24],vectors:[{x:-1,y:0},{x:1,y:0},{x:0,y:-1},{x:0,y:-.5}]});
    const released=runShot(spec);
    reports.push({revision,name:spec.name,released,timings,nudges});
    rows.push({name:spec.name,contacts:released.metrics.flipperContacts,successfulDelays:timings.filter(t=>t.result.metrics.targetReached).map(t=>t.delay),nudgeTargetHits:nudges.trials.filter(t=>t.result.metrics.targetReached).length,longestSlow:released.metrics.longestSlowSeconds});
  }
  summary.push({revision,families:rows.length,contactFamilies:rows.filter(r=>r.contacts>0).length,redirectFamilies:rows.filter(r=>r.successfulDelays.length).length,successfulTimingSamples:rows.reduce((n,r)=>n+r.successfulDelays.length,0),nudgeTargetHits:rows.reduce((n,r)=>n+r.nudgeTargetHits,0),rows});
}
mkdirSync('results',{recursive:true});
writeFileSync('results/protected-feed-review.json',JSON.stringify(reports));
writeFileSync('results/protected-feed-summary.json',JSON.stringify(summary,null,2));
console.log(JSON.stringify(summary.map(({rows,...totals})=>totals),null,2));
