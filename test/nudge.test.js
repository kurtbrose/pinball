import test from 'node:test';
import assert from 'node:assert/strict';
import { Simulation,replay } from '../src/simulation.js';
import { runShot,searchNudges } from '../src/shot-lab.js';
import { table,firstTable } from '../src/table.js';

const empty={...firstTable,walls:[],flippers:[],mechanisms:[],gates:[],gravity:0,damping:{linear:0,angular:0},game:{...firstTable.game,enabled:false},spawn:{x:3,y:3,vx:0,vy:0}};
test('nudge is bounded, edge triggered, cooled down and inactive outside play',()=>{
  const sim=new Simulation({},empty),right={nudge:{x:1,y:0}};
  sim.step(right);assert.ok(Math.abs(sim.ball.getLinearVelocity().x-1.2)<1e-10);
  for(let i=0;i<40;i++)sim.step(right);
  assert.ok(Math.abs(sim.ball.getLinearVelocity().x-1.2)<1e-10);
  sim.step();sim.step(right);assert.ok(Math.abs(sim.ball.getLinearVelocity().x-2.4)<1e-10);
  sim.step();sim.step(right);assert.equal(sim.events.length,0);
  assert.throws(()=>sim.step({nudge:{x:2,y:0}}),/Nudge/);
  assert.throws(()=>sim.step({nudge:{x:NaN,y:0}}),/Nudge/);
  const ready=new Simulation({},firstTable);ready.step(right);assert.equal(ready.events.length,0);
  const calibration=new Simulation({},table);calibration.step(right);assert.equal(calibration.events.length,0);
  sim.phase='gameover';sim.step();sim.step(right);assert.equal(sim.events.length,0);
});
test('nudge replay and shot reports reproduce direction, strength and events',()=>{
  const commands=[{tick:0,input:{nudge:{x:-.5,y:0}}},{tick:1,input:{}},{tick:40,input:{nudge:{x:0,y:-1}}},{tick:41,input:{}}];
  assert.deepEqual(replay(commands,100,empty),replay(commands,100,empty));
  const spec={table:empty,initial:{x:3,y:3,vx:0,vy:0},ticks:100,commands};
  const result=runShot(spec);assert.deepEqual(runShot(result.config),result);
  assert.equal(result.events.filter(e=>e.type==='table.nudge').length,2);
  assert.ok(result.trajectory.at(-1).x<3);assert.ok(result.trajectory.at(-1).y<3);
});
test('nudge sweep preserves baseline and changes recoverability for a near-drain arrival',()=>{
  const spec={table:empty,initial:{x:3,y:10.2,vx:0,vy:1},ticks:60,target:{x:2.5,y:10.12,width:1,height:.02}};
  const result=searchNudges(spec,{delays:[0,6],vectors:[{x:0,y:-1},{x:1,y:0},{x:0,y:-.25}]});
  assert.equal(result.baseline.outcome,'drained');
  assert.equal(result.trials[0].result.outcome,'timeout');
  assert.equal(result.trials[0].result.metrics.targetReached,true);
  assert.equal(result.trials[1].result.outcome,'drained');
  assert.equal(result.trials[2].result.outcome,'drained');
  assert.deepEqual(result,searchNudges(spec,{delays:[0,6],vectors:[{x:0,y:-1},{x:1,y:0},{x:0,y:-.25}]}));
});

