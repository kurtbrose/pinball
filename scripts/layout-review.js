// Compare the complete refinement with the saved table before the full pass.
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { firstTable } from '../src/table.js';
import { shotPresets } from '../src/shot-presets.js';
import { runShot, searchTimings } from '../src/shot-lab.js';

const baseline=JSON.parse(readFileSync(new URL('../scenarios/layout-before-full.json',import.meta.url),'utf8'));
const scenarios=JSON.parse(readFileSync(new URL('../scenarios/layout-refinement.json',import.meta.url),'utf8'));
const reports={},summaries={};
for(const [revision,table] of [['before',baseline],['after',firstTable]]){
  const summary={timings:[],arrivals:[]};
  for(const side of ['left','right'])for(const vy of [1,2,3])for(const target of ['pop-left','pop-center','pop-right']){
    const trials=searchTimings({...shotPresets[side],table,target:{mechanismId:target},initial:{...shotPresets[side].initial,vy},commands:[]},
      {side,delays:Array.from({length:25},(_,i)=>i*2),holdTicks:24});
    reports[`${revision}-${side}-${vy}-${target}`]=trials;
    summary.timings.push({side,vy,target,successfulDelays:trials.filter(t=>t.result.metrics.targetReached).map(t=>t.delay),
      drains:trials.filter(t=>t.result.outcome==='drained').length,censored:trials.filter(t=>t.result.metrics.censored).length,
      longestSlowSeconds:Math.max(...trials.map(t=>t.result.metrics.longestSlowSeconds))});
  }
  for(const spec of scenarios){
    // The old right inlane has no shared full-ball starting corridor with the
    // widened revision. Do not compare an initially overlapping old-world ball.
    if(revision==='before'&&spec.name.includes('Right')&&spec.name.includes('inlane'))continue;
    // Extend held feeds and release after ten seconds to distinguish a catch
    // that can be released from an inaccessible passive trap.
    const release=spec.warmup&&!spec.commands?.length?{ticks:2400,commands:[{tick:1200,input:{}}]}:{};
    const result=runShot({...spec,...release,table});reports[`${revision}-${spec.name}`]=result;
    summary.arrivals.push({name:spec.name,outcome:result.outcome,targetReached:result.metrics.targetReached,
      survivalSeconds:result.metrics.survivalSeconds,longestSlowSeconds:result.metrics.longestSlowSeconds,
      returns:result.metrics.returnCrossings,final:result.final.ball});
  }
  summaries[revision]=summary;
}
mkdirSync('results',{recursive:true});
writeFileSync('results/layout-refinement.json',JSON.stringify(reports));
writeFileSync('results/layout-summary.json',JSON.stringify(summaries,null,2));
console.log(JSON.stringify(summaries,null,2));
