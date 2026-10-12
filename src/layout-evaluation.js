import { runShot,searchTimings } from './shot-lab.js';
import { runRoute } from './route-lab.js';

/** @typedef {typeof import('./table.js').table} Table */
/** @typedef {{x:number,y:number,width:number,height:number}} Region */
/** @typedef {{bounds:Region,gridSpacing:number,playfield:number[][],feeds:{id:string,side:'left'|'right',start:{x:number,y:number},corridor:Region}[]}} EvaluationProfile */
/** @typedef {{id:string,severity:'failure'|'warning',reason:string,config:import('./shot-lab.js').ShotSpec,result?:ReturnType<typeof runShot>}} Finding */

/** @param {{x:number,y:number}} p @param {number[]} a @param {number[]} b */
function distance(p,a,b){
  const dx=b[0]-a[0],dy=b[1]-a[1],length=dx*dx+dy*dy;
  const u=length?Math.max(0,Math.min(1,((p.x-a[0])*dx+(p.y-a[1])*dy)/length)):0;
  return Math.hypot(p.x-a[0]-u*dx,p.y-a[1]-u*dy);
}
/** @param {{x:number,y:number}} p @param {number[][]} polygon */
function inside(p,polygon){
  let included=false;
  for(let i=0,j=polygon.length-1;i<polygon.length;j=i++){
    const a=polygon[i],b=polygon[j];
    if((a[1]>p.y)!==(b[1]>p.y)&&p.x<(b[0]-a[0])*(p.y-a[1])/(b[1]-a[1])+a[0])included=!included;
  }
  return included;
}
/** Reject overlapping synthetic starts, including guide and polygon interiors.
 * @param {{x:number,y:number}} p @param {Table} table */
export function clearArrival(p,table){
  const r=table.ballRadius+.005;
  const edges=[...table.walls,...(table.guides??[]).map(g=>[g.a,g.b]),...table.gates.map(g=>[g.a,g.b])];
  if(edges.some(([a,b])=>distance(p,a,b)<r))return false;
  for(const f of table.flippers){
    const angle=f.side===1?table.restAngle:Math.PI-table.restAngle;
    if(distance(p,[f.x,f.y],[f.x+table.flipperLength*Math.cos(angle),f.y+table.flipperLength*Math.sin(angle)])<r+table.flipperRadius)return false;
  }
  for(const m of table.mechanisms){
    if(!m.vertices){if(Math.hypot(p.x-m.x,p.y-m.y)<r+m.radius)return false;}
    else{
      let positive=true,negative=true;
      for(let i=0;i<m.vertices.length;i++){
        const a=m.vertices[i],b=m.vertices[(i+1)%m.vertices.length];
        const cross=(b[0]-a[0])*(p.y-a[1])-(b[1]-a[1])*(p.x-a[0]);
        positive&&=cross>=0;negative&&=cross<=0;
        if(distance(p,a,b)<r)return false;
      }
      if(positive||negative)return false;
    }
  }
  return true;
}

/** Deterministic space coverage plus geometry-derived corner/edge probes.
 * No randomness, automatic player or layout optimizer.
 * @param {Table} table @param {EvaluationProfile} profile */
export function generateArrivals(table,profile){
  if(!Number.isFinite(profile.gridSpacing)||profile.gridSpacing<=0||profile.gridSpacing<.1)throw new Error('Grid spacing must be finite and at least 0.1');
  const b=profile.bounds;
  if(profile.playfield.length<3||profile.playfield.some(p=>p.length!==2||!p.every(Number.isFinite)))throw new Error('Evaluation needs a finite playable polygon');
  if(![b.x,b.y,b.width,b.height].every(Number.isFinite)||b.width<=0||b.height<=0||b.width*b.height/profile.gridSpacing**2>2000)throw new Error('Invalid evaluation bounds');
  /** @type {Map<string,{x:number,y:number,source:string}>} */
  const candidates=new Map();
  let screened=0;
  /** @param {number} x @param {number} y @param {string} source */
  function add(x,y,source){
    if(x<b.x||x>b.x+b.width||y<b.y||y>b.y+b.height||!inside({x,y},profile.playfield))return;
    const key=`${x.toFixed(6)},${y.toFixed(6)}`;
    if(candidates.has(key))return;
    if(!clearArrival({x,y},table)){screened++;return;}
    candidates.set(key,{x,y,source});
  }
  for(let yi=0;yi<=Math.floor(b.height/profile.gridSpacing);yi++)for(let xi=0;xi<=Math.floor(b.width/profile.gridSpacing);xi++)add(b.x+xi*profile.gridSpacing,b.y+yi*profile.gridSpacing,'grid');
  /** @param {number[]} center @param {number} radius @param {string} source */
  function ring(center,radius,source){for(let i=0;i<8;i++){const angle=i*Math.PI/4;add(center[0]+radius*Math.cos(angle),center[1]+radius*Math.sin(angle),source);}}
  for(const m of table.mechanisms){
    if(!m.vertices)ring([m.x,m.y],m.radius+table.ballRadius+.03,`mechanism:${m.id}`);
    else for(const vertex of m.vertices)ring(vertex,table.ballRadius+.03,`corner:${m.id}`);
  }
  const edges=[...table.walls,...(table.guides??[]).map(g=>[g.a,g.b])];
  for(const [index,[a,c]] of edges.entries()){
    ring(a,table.ballRadius+.03,`edge:${index}`);ring(c,table.ballRadius+.03,`edge:${index}`);
    const length=Math.hypot(c[0]-a[0],c[1]-a[1]);
    if(length)for(const side of [-1,1])add((a[0]+c[0])/2-side*(c[1]-a[1])/length*(table.ballRadius+.03),(a[1]+c[1])/2+side*(c[0]-a[0])/length*(table.ballRadius+.03),`edge:${index}`);
  }
  return {arrivals:[...candidates.values()],screened};
}

/** Routine bounded mechanical evaluation. Core feeds fail checks; off-angle
 * control gaps and censored motion remain diagnostics. No fairness score.
 * @param {Table} table @param {EvaluationProfile} profile */
export function evaluateLayout(table,profile){
  const {arrivals,screened}=generateArrivals(table,profile);
  /** @type {Finding[]} */
  const findings=[];
  /** @type {{id:string,family:string,outcome:string,censored:boolean,contacts:number,longestSlow:number}[]} */
  const observations=[];
  let simulations=0;
  /** @param {string} id @param {string} family @param {import('./shot-lab.js').ShotSpec} spec */
  function observe(id,family,spec){
    const result=runShot(spec);simulations++;
    observations.push({id,family,outcome:result.outcome,censored:result.metrics.censored,contacts:result.metrics.flipperContacts,longestSlow:result.metrics.longestSlowSeconds});
    if(result.outcome==='escaped')findings.push({id,severity:'failure',reason:'Ball escaped modeled bounds',config:result.config,result});
    // Only diagnose terminal slow states, not a slow interval before an escape.
    const tail=result.trajectory.slice(-10);
    if(result.metrics.censored&&result.metrics.longestSlowSeconds>=2&&tail.length===10&&tail.every(p=>Math.hypot(p.vx,p.vy)<.1)){
      const tick=result.metrics.elapsedTicks;
      const recoveries=[{x:-1,y:0},{x:1,y:0},{x:0,y:-1}].map(nudge=>{
        simulations++;
        return runShot({...spec,ticks:tick+600,commands:[...(spec.commands??[]),{tick,input:{left:true,right:true}},{tick:tick+60,input:{}},{tick:tick+120,input:{nudge}},{tick:tick+121,input:{}}]});
      });
      const responsive=recoveries.find(r=>!r.metrics.censored||r.trajectory.slice(-10).some(p=>Math.hypot(p.vx,p.vy)>=.1));
      const recovery=responsive??recoveries[0];
      findings.push({id,severity:responsive?'warning':'failure',reason:responsive?'Passive low-speed state responds to input; inspect catch/control requirement':'Persistent low-speed state after bounded release/stroke and three-direction nudge probes; inspect candidate trap',config:recovery.config,result:recovery});
    }else if(result.metrics.censored)findings.push({id,severity:'warning',reason:'Moving time-limit observation; eventual lifetime and passive cycle unproven',config:result.config,result});
    return result;
  }
  for(const [index,p] of arrivals.entries())for(const vx of [-.15,0,.15]){
    observe(`space-${index}-vx${vx}`,p.source,{table,initial:{x:p.x,y:p.y,vx,vy:.1},ticks:2400,sampleEvery:12});
  }
  const feeds=[];
  for(const feed of profile.feeds)for(const offset of [0,.12])for(const vx of [-.4,0,.4])for(const vy of [.1,2,5]){
    const id=`${feed.id}-offset${offset}-vx${vx}-vy${vy}`;
    const initial={x:feed.start.x+(feed.side==='left'?offset:-offset),y:feed.start.y,vx,vy};
    const spec={table,initial,ticks:1800,sampleEvery:12};
    const required=offset===0&&vx===0;
    if(!clearArrival(initial,table)){
      findings.push({id,severity:required?'failure':'warning',reason:'Declared upstream route start is blocked; route requires review',config:spec});continue;
    }
    const passive=runRoute(spec,[{id:'feed',region:feed.corridor},{id:'paddle',event:{type:'flipper.contact'}}]);simulations++;
    const row={id,required,feed:passive.complete,contact:passive.result.metrics.flipperContacts>0,successfulDelays:/** @type {number[]} */([])};
    for(let delay=0;delay<=360;delay+=12){
      const trial=runRoute({...spec,commands:[{tick:delay,input:{[feed.side]:true}},{tick:delay+24,input:{}}]},[
        {id:'paddle',event:{type:'flipper.contact'}},{id:'return',region:{x:profile.bounds.x,y:feed.corridor.y-.4,width:profile.bounds.width,height:.15}}
      ]);simulations++;
      if(trial.complete)row.successfulDelays.push(delay);
    }
    if(!passive.complete||!row.successfulDelays.length)findings.push({id,severity:required?'failure':'warning',reason:!passive.complete?'Upstream arrival misses ordered protected-feed/paddle route':'No sampled flipper timing redirects this upstream arrival',config:spec,result:passive.result});
    feeds.push(row);
  }
  const aims=[];
  for(const [index,f] of table.flippers.entries())for(const target of table.mechanisms.filter(m=>m.type==='bumper'))for(const vy of [1,3]){
    const side=index===0?'left':'right';
    const spec={table,initial:{x:f.x+f.side*(table.flipperLength-.2),y:f.y-.1,vx:-f.side*.4,vy},ticks:600,sampleEvery:12,target:{mechanismId:target.id}};
    const id=`${side}-${target.id}-vy${vy}`;
    if(!clearArrival(spec.initial,table)){findings.push({id,severity:'failure',reason:'Declared flipper approach is blocked',config:spec});continue;}
    const trials=searchTimings(spec,{side,delays:Array.from({length:25},(_,i)=>i*2),holdTicks:24});simulations+=trials.length;
    const successes=trials.filter(t=>t.result.metrics.targetReached);
    aims.push({id,successfulDelays:successes.map(t=>t.delay)});
    if(!successes.length)findings.push({id,severity:'failure',reason:'No sampled timing reaches bumper from declared approach',config:trials[0].result.config,result:trials[0].result});
    else{
      const follow=observe(`${id}-return`,'successful-shot-return',{...successes[0].result.config,ticks:2400});
      if(!follow.events.some(e=>e.type==='flipper.contact'&&e.tick>(follow.metrics.targetTick??Infinity)))findings.push({id,severity:'warning',reason:'Successful target hit has no later paddle contact in observation; inspect downstream loss',config:follow.config,result:follow});
    }
  }
  return {version:1,physics:{hz:120,engine:'planck',version:'1.5.0'},profile:structuredClone(profile),coverage:{positions:arrivals.length,screened,simulations},
    observations,feeds,aims,findings,failures:findings.filter(f=>f.severity==='failure').length,
    limits:['Bounds deliberately exclude the ready/shooter channel; launch and lifecycle are covered by game tests.',
      'A bounded recovery probe flags persistent slow states; it does not prove permanent trapping.',
      'Core straight wall feeds are required; varied angled arrivals are diagnostics.',
      'Target reachability and return contact do not establish independent aiming or second-action control.',
      'Human fairness and feel are not evaluated.']};
}
