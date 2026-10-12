import { readFileSync,mkdirSync,writeFileSync } from 'node:fs';
import { firstTable } from '../src/table.js';
import { shotPresets } from '../src/shot-presets.js';
import { runShot,searchTimings,searchNudges } from '../src/shot-lab.js';
import { runRoute } from '../src/route-lab.js';
const before=JSON.parse(readFileSync(new URL('../scenarios/layout-before-route-review.json',import.meta.url),'utf8'));
function wallArrivals(){
  return ['left','right'].flatMap(side=>[.03,.15].flatMap(offset=>[-.4,0,.4].flatMap(vx=>[.1,2,5].map(vy=>({
    name:`${side} wall offset=${offset} vx=${vx} vy=${vy}`,side,
    initial:{x:side==='left'?.35+firstTable.ballRadius+offset:5.1-firstTable.ballRadius-offset,y:4.5,vx,vy}
  })))));
}
const reports=[],summary=[];
for(const [revision,table] of [['before',before],['after',firstTable]]){
  const walls=[];
  for(const arrival of wallArrivals()){
    const spec={name:arrival.name,table,initial:arrival.initial,ticks:1800};
    const stages=[{id:'paddle contact',event:{type:'flipper.contact'}},{id:'upward return after contact',region:{x:1,y:6.1,width:3.8,height:.15}}];
    const passiveRoute=runRoute(spec,stages),passive=passiveRoute.result;
    const feedRoute=runRoute(spec,[{id:'protected inlane',region:{x:arrival.side==='left'?1.08:4.05,y:6.5,width:.42,height:.2}},{id:'paddle contact',event:{type:'flipper.contact'}}]);
    // Start upstream of the collector; never transplant a favorable lower state.
    const timings=Array.from({length:31},(_,i)=>i*12).map(delay=>({delay,...runRoute({...spec,commands:[{tick:delay,input:{[arrival.side]:true}},{tick:delay+24,input:{}}]},stages)}));
    const nudges=searchNudges({...spec,ticks:900},{delays:[24,48,72],vectors:[{x:-1,y:0},{x:1,y:0},{x:0,y:-1}]});
    reports.push({revision,route:arrival.name,passive,passiveStages:passiveRoute.stages,feedStages:feedRoute.stages,timings,nudges});
    walls.push({name:arrival.name,side:arrival.side,contact:passive.metrics.flipperContacts>0,outcome:passive.outcome,
      longestSlow:passive.metrics.longestSlowSeconds,feedComplete:feedRoute.complete,passiveComplete:passiveRoute.complete,successfulDelays:timings.filter(t=>t.complete).map(t=>t.delay)});
  }
  const other=[];
  const specs=[
    ...[11,13.5,16].map(speed=>({name:`Launch ${speed}`,initial:{x:table.spawn.x,y:8.96,vx:0,vy:-speed},target:{x:.5,y:2,width:4.4,height:4}})),
    ...['left','right'].flatMap(side=>['pop-left','pop-center','pop-right'].map(id=>({...shotPresets[side],name:`${side} shot to ${id}`,target:{mechanismId:id}}))),
    ...['left','right'].flatMap(side=>[.1,2].map(vy=>({name:`${side} inlane ${vy}`,initial:{x:side==='left'?1.15:4.25,y:6.6,vx:0,vy}}))),
    {name:'Left sling approach',initial:{x:2,y:7.5,vx:0,vy:-3},target:{mechanismId:'sling-left'}},
    {name:'Right sling approach',initial:{x:3.8,y:7.5,vx:0,vy:-3},target:{mechanismId:'sling-right'}},
    {name:'Left outlane lateral miss',initial:{x:1.15,y:5.9,vx:-2,vy:.1}},
    {name:'Right outlane lateral miss',initial:{x:4.3,y:5.9,vx:2,vy:.1}},
    {name:'Center miss',initial:{x:3,y:8.7,vx:0,vy:.1}},
    ...JSON.parse(readFileSync(new URL('../scenarios/layout-refinement.json',import.meta.url),'utf8')).filter(s=>s.name.includes('approach'))
  ];
  for(const spec of specs){
    let timings=[],commands=spec.commands;
    if(spec.name.includes(' shot to ')){
      timings=searchTimings({...spec,table,commands:[],ticks:600},{side:spec.name.startsWith('left')?'left':'right',delays:Array.from({length:25},(_,i)=>i*2),holdTicks:24});
      const success=timings.find(t=>t.result.metrics.targetReached);
      if(success)commands=success.result.config.commands;
    }
    const result=runShot({...spec,commands,table,ticks:2400});
    reports.push({revision,route:spec.name,result,timings});
    other.push({name:spec.name,outcome:result.outcome,targetReached:result.metrics.targetReached,
      successfulDelays:timings.filter(t=>t.result.metrics.targetReached).map(t=>t.delay),
      contacts:result.metrics.flipperContacts,contactsAfterTarget:result.events.filter(e=>e.type==='flipper.contact'&&result.metrics.targetTick!==null&&e.tick>result.metrics.targetTick).length,
      hitDistribution:result.metrics.hitDistribution,longestSlow:result.metrics.longestSlowSeconds,censored:result.metrics.censored});
  }
  summary.push({revision,walls,other});
}
mkdirSync('results',{recursive:true});writeFileSync('results/route-review.json',JSON.stringify(reports));
writeFileSync('results/route-summary.json',JSON.stringify(summary,null,2));
console.log(JSON.stringify(summary.map(s=>({revision:s.revision,wallFamilies:s.walls.length,wallContacts:s.walls.filter(w=>w.contact).length,
  wallRedirects:s.walls.filter(w=>w.successfulDelays.length).length,longestSlow:Math.max(...s.walls.map(w=>w.longestSlow)),other:s.other})),null,2));
