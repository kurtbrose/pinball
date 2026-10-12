import {firstTable} from '../src/table.js';
import {runShot} from '../src/shot-lab.js';
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
const before=JSON.parse(readFileSync(new URL('../scenarios/layout-before-full.json',import.meta.url),'utf8'));
function distance(p,a,b){const dx=b[0]-a[0],dy=b[1]-a[1],u=Math.max(0,Math.min(1,((p.x-a[0])*dx+(p.y-a[1])*dy)/(dx*dx+dy*dy)));return Math.hypot(p.x-a[0]-u*dx,p.y-a[1]-u*dy);}
function clear(p,table,held){
  if([...table.walls,...table.gates.map(g=>[g.a,g.b])].some(([a,b])=>distance(p,a,b)<.185))return false;
  for(const f of table.flippers){const angle=f.side===1?(held?table.raisedAngle:table.restAngle):Math.PI-(held?table.raisedAngle:table.restAngle);if(distance(p,[f.x,f.y],[f.x+table.flipperLength*Math.cos(angle),f.y+table.flipperLength*Math.sin(angle)])<.305)return false;}
  for(const m of table.mechanisms){
    if(!m.vertices){if(Math.hypot(p.x-m.x,p.y-m.y)<m.radius+.185)return false;}
    else {const v=m.vertices;let positive=true,negative=true;for(let i=0;i<v.length;i++){const a=v[i],b=v[(i+1)%v.length];const cross=(b[0]-a[0])*(p.y-a[1])-(b[1]-a[1])*(p.x-a[0]);positive&&=cross>=0;negative&&=cross<=0;if(distance(p,a,b)<.185)return false;}if(positive||negative)return false;}
  }
  return true;
}
const summaries={},reports={};
for(const [revision,table] of [['before',before],['after',firstTable]]){
 let total=0,drained=0,censored=0,failures=[],extensions=[],maxSlow=0;
 for(let yi=0;yi<15;yi++)for(let xi=0;xi<17;xi++)for(const held of [false,true]){
  const p={x:.6+xi*.27,y:1+yi*.48};if(!clear(p,before,held)||!clear(p,firstTable,held))continue;
  for(const actuation of ['servo','solenoid']){
   const r=runShot({table,actuation,initial:{...p,vx:.03,vy:.1},ticks:3600,sampleEvery:60,warmup:held?{ticks:60,input:{left:true,right:true}}:undefined,commands:[{tick:1200,input:{}},{tick:1320,input:{left:true,right:true}},{tick:1344,input:{}}]});
   total++;if(r.outcome==='drained')drained++;if(r.metrics.censored)censored++;maxSlow=Math.max(maxSlow,r.metrics.longestSlowSeconds);
   if(r.outcome==='escaped')failures.push({p,held,actuation,outcome:r.outcome});
   if(r.metrics.censored){
    const extended=runShot({...r.config,ticks:12000});
    reports[`${revision}-${xi}-${yi}-${held}-${actuation}-extended`]=extended;
    extensions.push({p,held,actuation,outcome:extended.outcome,seconds:extended.metrics.survivalSeconds,longestSlowSeconds:extended.metrics.longestSlowSeconds});
    const tail=extended.trajectory.slice(-5);
    if(extended.metrics.censored&&tail.every(s=>Math.hypot(s.vx,s.vy)<.1))failures.push({p,held,actuation,outcome:extended.outcome,slow:extended.metrics.longestSlowSeconds,final:extended.final.ball});
   }
   reports[`${revision}-${xi}-${yi}-${held}-${actuation}`]={config:r.config,outcome:r.outcome,metrics:r.metrics,trajectory:r.trajectory,events:r.events};
  }
 }
 summaries[revision]={total,drained,censored,maxSlow,extensions,failures};
}
mkdirSync('results',{recursive:true});
writeFileSync('results/broad-audit.json',JSON.stringify(summaries,null,2));
writeFileSync('results/broad-trials.json',JSON.stringify(reports));
console.log(JSON.stringify(summaries));
