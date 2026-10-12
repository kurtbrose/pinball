import { runShot,crossesRectangle } from './shot-lab.js';
/** @typedef {{id:string,region?:{x:number,y:number,width:number,height:number},event?:{type:string,id?:string}}} RouteStage */
/** Trace ordered route stages at every physics tick. A stage crossing is evidence
 * of passage only; contact and control require separate stages/probes.
 * @param {import('./shot-lab.js').ShotSpec} spec @param {RouteStage[]} stages */
export function runRoute(spec,stages){
  if(!stages.length||new Set(stages.map(s=>s.id)).size!==stages.length)throw new Error('Route stages need unique ids');
  for(const stage of stages){
    if(!!stage.region===!!stage.event)throw new Error('Each route stage needs either a region or an event');
    const r=stage.region;
    if(r&&(![r.x,r.y,r.width,r.height].every(Number.isFinite)||r.width<=0||r.height<=0))throw new Error('Invalid route region');
  }
  const result=runShot({...spec,sampleEvery:1});
  let next=0;
  const findings=stages.map(s=>({id:s.id,tick:/** @type {number|null} */(null)}));
  for(let i=1;i<result.trajectory.length&&next<stages.length;i++){
    const a=result.trajectory[i-1],b=result.trajectory[i];
    while(next<stages.length){
      const stage=stages[next],event=stage.event;
      const reached=stage.region?crossesRectangle(a,b,stage.region):result.events.some(e=>e.tick===b.tick&&e.type===event?.type&&(!event.id||e.id===event.id));
      if(!reached)break;
      findings[next].tick=b.tick;next++;
    }
  }
  const last=result.trajectory.at(-1);
  result.trajectory=result.trajectory.filter(p=>p.tick===0||p.tick%(spec.sampleEvery??3)===0||p===last);
  result.config=structuredClone(spec);
  return {stages:findings,complete:next===stages.length,result};
}
