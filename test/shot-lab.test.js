import test from 'node:test';
import assert from 'node:assert/strict';
import { runShot,searchTimings } from '../src/shot-lab.js';
import { shotPresets } from '../src/shot-presets.js';
import { table,firstTable } from '../src/table.js';

const empty={...table,walls:[],flippers:[],mechanisms:[],gates:[],gravity:0,damping:{linear:0,angular:0}};
const base={table:empty,initial:{x:2,y:3,vx:0,vy:0},ticks:240};

test('saved shots reproduce trajectories, events and metrics without mutating definitions',()=>{
  const spec=structuredClone(shotPresets.left),before=JSON.stringify(spec);
  const result=runShot(spec);
  assert.deepEqual(result,runShot(spec));
  assert.equal(JSON.stringify(spec),before);
  assert.deepEqual(JSON.parse(JSON.stringify(result)),JSON.parse(JSON.stringify(runShot(JSON.parse(JSON.stringify(result)).config))));
});
test('heatmap and metrics use every tick regardless of trajectory sampling',()=>{
  const spec={...base,initial:{x:1,y:3,vx:1,vy:0},ticks:120};
  const dense=runShot({...spec,sampleEvery:1}),sparse=runShot({...spec,sampleEvery:17});
  assert.deepEqual(dense.metrics,sparse.metrics);assert.deepEqual(dense.heatmap,sparse.heatmap);
  assert.equal(sparse.heatmap.counts.reduce((a,b)=>a+b,0),120);
  assert.equal(sparse.trajectory.at(-1).tick,120);assert.ok(sparse.trajectory.length<dense.trajectory.length);
});
test('rectangle targets detect swept centre crossings between tick endpoints',()=>{
  const result=runShot({...base,initial:{x:1,y:3,vx:20,vy:0},ticks:10,target:{id:'narrow',x:1.05,y:2.9,width:.01,height:.2}});
  assert.equal(result.metrics.targetReached,true);assert.equal(result.metrics.targetTick,1);
});
test('shot stops at first drain and does not count respawn idle time',()=>{
  const result=runShot({...base,table:{...empty,game:{...empty.game,enabled:true}},initial:{x:3,y:10.25,vx:0,vy:2}});
  assert.equal(result.outcome,'drained');assert.ok(result.metrics.elapsedTicks<10);
  assert.equal(result.metrics.censored,false);assert.ok(result.metrics.drain.y>empty.game.drainY);
  assert.equal(result.events.filter(e=>e.type==='ball.drain').length,1);
});
test('timeouts, escapes and sustained low speed are reported distinctly',()=>{
  const still=runShot(base);assert.equal(still.outcome,'timeout');assert.equal(still.metrics.censored,true);
  assert.equal(still.metrics.stuckSeconds,2);assert.equal(still.metrics.longestSlowSeconds,2);
  assert.equal(still.metrics.targetCoverage,null);assert.equal(still.metrics.multiballSeconds,null);
  const moving=runShot({...base,initial:{x:2,y:3,vx:.2,vy:0}});assert.equal(moving.metrics.stuckSeconds,0);
  const escape=runShot({...base,initial:{x:5.9,y:3,vx:20,vy:0}});assert.equal(escape.outcome,'escaped');assert.equal(escape.metrics.censored,false);
});
test('flipper contact telemetry excludes bumper-only collisions',()=>{
  const shot=runShot({table,initial:{x:2.35,y:8.15,vx:0,vy:2},ticks:30,commands:[{tick:0,input:{left:true}}]});
  assert.ok(shot.metrics.flipperContacts>0);assert.ok(shot.events.some(e=>e.type==='flipper.contact'&&e.impulse>0));
  const bumper=runShot({table:{...firstTable,walls:[],gates:[],mechanisms:firstTable.mechanisms.filter(m=>m.id==='pop-left')},initial:{x:2.57,y:2.7,vx:-3,vy:0},ticks:12,target:{mechanismId:'pop-left'}});
  assert.equal(bumper.metrics.flipperContacts,0);assert.equal(bumper.metrics.hitDistribution['pop-left'],1);assert.equal(bumper.metrics.targetReached,true);
});
test('warmup is excluded from elapsed time and does not score',()=>{
  const result=runShot({...shotPresets.left,table,target:undefined,ticks:10,commands:[],warmup:{ticks:60,input:{left:true}}});
  assert.equal(result.metrics.elapsedTicks,10);assert.equal(result.trajectory[0].tick,0);
  assert.ok(Math.abs(result.trajectory[0].flippers[0].angle-table.raisedAngle)<.05);
  assert.ok(result.events.every(e=>e.tick>0&&e.tick<=10));
});
test('timing search reconstructs each trial and preserves both successes and failures',()=>{
  const spec={...shotPresets.left,commands:[]};
  const trials=searchTimings(spec,{side:'left',delays:[0,8,24,48],holdTicks:24});
  for(const trial of trials)assert.deepEqual(trial.result,runShot(trial.result.config));
  assert.ok(trials.some(t=>t.result.metrics.targetReached));
  assert.ok(new Set(trials.map(t=>JSON.stringify(t.result.trajectory))).size>1);
  assert.deepEqual(spec.commands,[]);
});
test('ambiguous commands and invalid experiments fail explicitly',()=>{
  assert.throws(()=>runShot({...base,commands:[{tick:1,input:{}},{tick:1,input:{left:true}}]}),/unique/);
  assert.throws(()=>runShot({...base,commands:[{tick:0,input:{reset:true}}]}),/left\/right/);
  assert.throws(()=>runShot({...base,initial:{x:NaN,y:0,vx:0,vy:0}}),/finite/);
  assert.throws(()=>searchTimings(base,{side:'left',delays:[0],holdTicks:24}),/target/);
  assert.throws(()=>runShot({...base,target:{mechanismId:'missing'}}),/Unknown target/);
});
