import { writeFile } from 'node:fs/promises';
import { firstTable } from '../src/table.js';
import { searchNudges } from '../src/shot-lab.js';
// Matched lower-feed probes, not a player model or fairness score.
const reports=[];
for(const [side,x] of [['left',1.5],['right',4.25]]){
  for(const vx of [-.4,0,.4])for(const vy of [.5,2]){
    const spec={name:`${side} lower feed vx=${vx} vy=${vy}`,table:firstTable,initial:{x,y:7.6,vx,vy},ticks:600};
    for(const held of [false,true]){
      const report=searchNudges(spec,{input:{[side]:held},delays:[0,12,24],vectors:[{x:-1,y:0},{x:1,y:0},{x:0,y:-1},{x:0,y:-.5}]});
      reports.push({name:spec.name,held,...report});
    }
  }
}
if(process.argv[2])await writeFile(process.argv[2],JSON.stringify(reports));
console.log(JSON.stringify(reports.map(r=>({name:r.name,held:r.held,baseline:{outcome:r.baseline.outcome,contacts:r.baseline.metrics.flipperContacts},trials:r.trials.map(t=>({delay:t.delay,nudge:t.nudge,outcome:t.result.outcome,contacts:t.result.metrics.flipperContacts,censored:t.result.metrics.censored}))})),null,2));
