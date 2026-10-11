import { Vec2 } from './physics.js';
import { Simulation, DT } from './simulation.js';

/** @typedef {{left?:boolean,right?:boolean}} FlipperInput */
/** @typedef {{tick:number,input:FlipperInput}} ShotCommand */
/** @typedef {{id:string,x:number,y:number,width:number,height:number}|{mechanismId:string}} ShotTarget */
/** @typedef {{name?:string,table:typeof import('./table.js').table,initial:{x:number,y:number,vx:number,vy:number,angle?:number,spin?:number},commands?:ShotCommand[],ticks?:number,sampleEvery?:number,actuation?:'servo'|'solenoid',warmup?:{ticks:number,input:FlipperInput},target?:ShotTarget,heatmap?:{columns:number,rows:number},slowSpeed?:number,stuckAfterTicks?:number}} ShotSpec */

/** A target rectangle tests the swept ball centre, not just sampled endpoints.
 * @param {{x:number,y:number}} a @param {{x:number,y:number}} b
 * @param {{x:number,y:number,width:number,height:number}} rect */
export function crossesRectangle(a,b,rect) {
  let enter=0,exit=1;
  for(const [start,delta,min,max] of [[a.x,b.x-a.x,rect.x,rect.x+rect.width],[a.y,b.y-a.y,rect.y,rect.y+rect.height]]) {
    if(Math.abs(delta)<1e-12){if(start<min||start>max)return false;continue;}
    const t1=(min-start)/delta,t2=(max-start)/delta;
    enter=Math.max(enter,Math.min(t1,t2));exit=Math.min(exit,Math.max(t1,t2));
    if(enter>exit)return false;
  }
  return true;
}

/** @param {number} value @param {number} min @param {number} max @param {string} name */
function integer(value,min,max,name){if(!Number.isInteger(value)||value<min||value>max)throw new Error(`${name} must be an integer from ${min} to ${max}`);}
/** @param {ShotSpec} spec */
function validate(spec){
  integer(spec.ticks??600,1,120000,'ticks');integer(spec.sampleEvery??3,1,120000,'sampleEvery');
  integer(spec.warmup?.ticks??0,0,1200,'warmup ticks');
  integer(spec.heatmap?.columns??24,1,100,'heatmap columns');integer(spec.heatmap?.rows??40,1,100,'heatmap rows');
  integer(spec.stuckAfterTicks??120,1,120000,'stuckAfterTicks');
  if(!Number.isFinite(spec.slowSpeed??.1)||(spec.slowSpeed??.1)<0)throw new Error('slowSpeed must be finite and nonnegative');
  for(const key of /** @type {const} */(['x','y','vx','vy']))if(!Number.isFinite(spec.initial?.[key]))throw new Error(`initial.${key} must be finite`);
  for(const value of [spec.initial.angle??0,spec.initial.spin??0])if(!Number.isFinite(value))throw new Error('Initial angle and spin must be finite');
  if(!spec.table||!(spec.table.width>0)||!(spec.table.height>0))throw new Error('A table with positive dimensions is required');
  if(spec.actuation && !['servo','solenoid'].includes(spec.actuation))throw new Error('Unknown actuation model');
  let previous=-1;
  for(const command of spec.commands??[]){
    integer(command.tick,0,(spec.ticks??600)-1,'command tick');
    if(command.tick<=previous)throw new Error('Commands must have unique, increasing ticks');previous=command.tick;
    if(!command.input||Object.entries(command.input).some(([key,value])=>!['left','right'].includes(key)||typeof value!=='boolean'))throw new Error('Shot commands accept only boolean left/right inputs');
  }
  if(spec.warmup?.input&&Object.entries(spec.warmup.input).some(([key,value])=>!['left','right'].includes(key)||typeof value!=='boolean'))throw new Error('Warmup accepts only boolean left/right inputs');
  if(spec.target){
    if('mechanismId' in spec.target){if(!spec.table.mechanisms.some(m=>m.id===/** @type {{mechanismId:string}} */(spec.target).mechanismId))throw new Error('Unknown target mechanism');}
    else if(![spec.target.x,spec.target.y,spec.target.width,spec.target.height].every(Number.isFinite)||spec.target.width<=0||spec.target.height<=0)throw new Error('Target rectangle must have finite coordinates and positive dimensions');
  }
}

/** Fresh deterministic world for one ball; ends on drain, escape, or tick limit.
 * No respawn and no arbitrary-world cloning. Inputs are full held snapshots.
 * @param {ShotSpec} spec */
export function runShot(spec){
  validate(spec);
  const config=structuredClone(spec);
  const ticks=spec.ticks??600,sampleEvery=spec.sampleEvery??3;
  const definition=structuredClone(spec.table);definition.game.enabled=false;
  const sim=new Simulation({actuation:spec.actuation??'servo'},definition);
  // An inactive ball cannot touch mechanisms or score during actuator warmup.
  sim.ball.setActive(false);
  for(let i=0;i<(spec.warmup?.ticks??0);i++)sim.step(spec.warmup?.input??{});
  sim.ball.setActive(true);sim.ball.setTransform(Vec2(spec.initial.x,spec.initial.y),spec.initial.angle??0);
  sim.ball.setLinearVelocity(Vec2(spec.initial.vx,spec.initial.vy));sim.ball.setAngularVelocity(spec.initial.spin??0);
  sim.drained=false;sim.phase='playing';sim.rules.score=0;
  const offset=sim.tick;
  /** @type {{type:string,id:string,tick:number,x:number,y:number,impulse?:number,flipperSpeed?:number}[]} */
  const events=[];
  const lastContacts=sim.flippers.map(()=>-Infinity);
  sim.world.on('post-solve',(contact,impulse)=>{
    const a=contact.getFixtureA().getBody(),b=contact.getFixtureB().getBody();
    if(a!==sim.ball&&b!==sim.ball)return;
    const index=sim.flippers.findIndex(f=>f.body===(a===sim.ball?b:a));
    if(index<0)return;
    const total=impulse.normalImpulses.reduce((sum,value)=>sum+value,0);if(total<=1e-8)return;
    const tick=sim.tick-offset;
    if(tick-lastContacts[index]>=3){
      const p=sim.ball.getPosition();events.push({type:'flipper.contact',id:`flipper-${index}`,tick:tick+1,x:p.x,y:p.y,impulse:total,flipperSpeed:sim.flippers[index].body.getAngularVelocity()});
    }
    lastContacts[index]=tick;
  });
  function sample(){
    const p=sim.ball.getPosition(),v=sim.ball.getLinearVelocity();
    return {tick:sim.tick-offset,x:p.x,y:p.y,vx:v.x,vy:v.y,angle:sim.ball.getAngle(),spin:sim.ball.getAngularVelocity(),flippers:sim.flippers.map(f=>({angle:f.body.getAngle(),speed:f.body.getAngularVelocity()}))};
  }
  const trajectory=[sample()];
  const columns=spec.heatmap?.columns??24,rows=spec.heatmap?.rows??40;
  const heatmap={columns,rows,width:spec.table.width,height:spec.table.height,counts:Array(columns*rows).fill(0),inBoundsTicks:0};
  /** @type {Record<string,number>} */
  const hits=Object.fromEntries(spec.table.mechanisms.map(m=>[m.id,0]));
  /** @type {{tick:number,x:number,y:number,vx:number,vy:number}[]} */
  const returns=[];
  const returnY=spec.table.flippers.length?Math.min(...spec.table.flippers.map(f=>f.y))-1:null;
  let input=spec.warmup?.input??{},commandIndex=0,previous=trajectory[0];
  let slowRun=0,longestSlow=0,stuckTicks=0,maxSpeed=Math.hypot(previous.vx,previous.vy);
  const stuckAfter=spec.stuckAfterTicks??120;
  let targetTick=/** @type {number|null} */(null),drain=/** @type {{tick:number,x:number,y:number}|null} */(null);
  let outcome='timeout';
  for(let tick=0;tick<ticks;tick++){
    const command=spec.commands?.[commandIndex];
    if(command?.tick===tick){input=command.input;commandIndex++;}
    sim.step(input);
    const current=sample(),speed=Math.hypot(current.vx,current.vy);maxSpeed=Math.max(maxSpeed,speed);
    for(const event of sim.events){
      events.push({...event,tick:current.tick,x:current.x,y:current.y});
      if(event.type.endsWith('.hit')&&event.id in hits)hits[event.id]++;
      if(spec.target&&'mechanismId' in spec.target&&event.id===spec.target.mechanismId&&event.type.endsWith('.hit')&&targetTick===null)targetTick=current.tick;
    }
    if(spec.target&&'x' in spec.target&&targetTick===null&&crossesRectangle(previous,current,spec.target))targetTick=current.tick;
    if(returnY!==null&&previous.y<returnY&&current.y>=returnY&&current.vy>0){
      const fraction=(returnY-previous.y)/(current.y-previous.y);
      returns.push({tick:current.tick,x:previous.x+(current.x-previous.x)*fraction,y:returnY,vx:current.vx,vy:current.vy});
    }
    const column=Math.floor(current.x/definition.width*columns),row=Math.floor(current.y/definition.height*rows);
    if(column>=0&&column<columns&&row>=0&&row<rows){heatmap.counts[row*columns+column]++;heatmap.inBoundsTicks++;}
    if(!sim.drained&&speed<(spec.slowSpeed??.1)){slowRun++;longestSlow=Math.max(longestSlow,slowRun);}
    else{if(slowRun>=stuckAfter)stuckTicks+=slowRun;slowRun=0;}
    if(sim.drained){outcome='drained';drain={tick:current.tick,x:current.x,y:current.y};}
    else if(current.x < -definition.ballRadius || current.x > definition.width+definition.ballRadius || current.y < -definition.ballRadius){outcome='escaped';}
    if(current.tick%sampleEvery===0||tick===ticks-1||outcome!=='timeout')trajectory.push(current);
    previous=current;
    if(outcome!=='timeout')break;
  }
  if(slowRun>=stuckAfter)stuckTicks+=slowRun;
  const elapsedTicks=sim.tick-offset;
  return {version:1,physics:{engine:'planck',version:'1.5.0',hz:120},config,outcome,
    metrics:{elapsedTicks,survivalSeconds:elapsedTicks*DT,censored:outcome==='timeout',drain,maxSpeed,
      flipperContacts:events.filter(e=>e.type==='flipper.contact').length,
      flipperContactsPerSecond:events.filter(e=>e.type==='flipper.contact').length/(elapsedTicks*DT),
      hitDistribution:hits,targetCoverage:Object.keys(hits).length?Object.values(hits).filter(n=>n>0).length/Object.keys(hits).length:null,
      stuckSeconds:stuckTicks*DT,longestSlowSeconds:longestSlow*DT,returnCrossings:returns,
      targetReached:spec.target?targetTick!==null:null,targetTick,multiballSeconds:null},
    heatmap,trajectory,events,final:sim.snapshot()};
}

/** Each timing reconstructs the same initial world. Results retain successful AND failed trials.
 * @param {ShotSpec} spec @param {{side:'left'|'right',delays:number[],holdTicks:number}} search */
export function searchTimings(spec,search){
  if(!spec.target)throw new Error('Timing search needs an explicit target');
  if(spec.commands?.length)throw new Error('Timing search generates commands; base commands must be empty');
  if(!['left','right'].includes(search.side))throw new Error('Search side must be left or right');
  if(!search.delays.length||search.delays.length>1000)throw new Error('Search needs 1–1000 delays');
  integer(search.holdTicks,1,spec.ticks??600,'holdTicks');
  if(new Set(search.delays).size!==search.delays.length)throw new Error('Search delays must be unique');
  for(const delay of search.delays)integer(delay,0,(spec.ticks??600)-1,'delay');
  return search.delays.map(delay=>{
    /** @type {ShotCommand[]} */
    const commands=[{tick:delay,input:{[search.side]:true}}];
    if(delay+search.holdTicks<(spec.ticks??600))commands.push({tick:delay+search.holdTicks,input:{}});
    const result=runShot({...spec,commands});
    return {delay,holdTicks:search.holdTicks,side:search.side,result};
  });
}
