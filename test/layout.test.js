import test from 'node:test';
import assert from 'node:assert/strict';
import { Simulation } from '../src/simulation.js';
import { firstTable } from '../src/table.js';
import { readFileSync } from 'node:fs';
import { runShot, searchTimings } from '../src/shot-lab.js';
import { shotPresets } from '../src/shot-presets.js';

test('playfield mechanisms allow full flipper stroke, hold and release',()=>{
  for(const actuation of /** @type {const} */(['servo','solenoid'])){
    const sim=new Simulation({actuation},firstTable);
    sim.ball.setActive(false);
    for(let i=0;i<60;i++){
      sim.step({left:true,right:true});
      if(i>=11){
        assert.ok(Math.abs(sim.flippers[0].body.getAngle()-firstTable.raisedAngle)<.04,`${actuation}: left full stroke`);
        assert.ok(Math.abs(sim.flippers[1].body.getAngle()-(Math.PI-firstTable.raisedAngle))<.04,`${actuation}: right full stroke`);
      }
    }
    for(let i=0;i<60;i++)sim.step();
    assert.ok(Math.abs(sim.flippers[0].body.getAngle()-firstTable.restAngle)<.04);
    assert.ok(Math.abs(sim.flippers[1].body.getAngle()-(Math.PI-firstTable.restAngle))<.04);
  }
});

test('released slow left inlane feed exits instead of lingering beside the sling',()=>{
  const specs=JSON.parse(readFileSync(new URL('../scenarios/layout-refinement.json',import.meta.url),'utf8'));
  const arrival=specs.find(spec=>spec.name==='Left slow inlane');
  const result=runShot({...arrival,table:firstTable,ticks:1200});
  assert.equal(result.outcome,'drained');
  assert.equal(result.metrics.stuckSeconds,0);
});

test('inlane feeds and held-heel arrivals release without a persistent trap',()=>{
  for(const actuation of /** @type {const} */(['servo','solenoid']))for(const x of [1.1,1.15,1.25,1.35,4.1,4.15,4.25,4.3])for(const vy of [.1,1,3])for(const held of [false,true]){
    const r=runShot({table:firstTable,actuation,initial:{x,y:6.6,vx:0,vy},ticks:3600,
      warmup:held?{ticks:60,input:{left:true,right:true}}:undefined,
      commands:held?[{tick:600,input:{}}]:[]});
    assert.equal(r.outcome,'drained',`${actuation}, x=${x}, vy=${vy}, held=${held}`);
    if(!held)assert.ok(r.metrics.longestSlowSeconds<2);
  }
});

test('a slow ball resting on the bare heel can be played out with a stroke',()=>{
  for(const actuation of /** @type {const} */(['servo','solenoid'])){
    const r=runShot({table:firstTable,actuation,initial:{x:1.68,y:7.72,vx:.03,vy:.1},ticks:2400,
      commands:[{tick:600,input:{left:true}},{tick:624,input:{}}]});
    assert.equal(r.outcome,'drained');
  }
});

test('both flippers retain access to every bumper across different arrival speeds',()=>{
  for(const side of /** @type {const} */(['left','right']))for(const vy of [1,3])for(const mechanismId of ['pop-left','pop-center','pop-right']){
    const trials=searchTimings({...shotPresets[side],table:firstTable,initial:{...shotPresets[side].initial,vy},commands:[],target:{mechanismId}},
      {side,delays:Array.from({length:25},(_,i)=>i*2),holdTicks:24});
    assert.ok(trials.some(t=>t.result.metrics.targetReached),`${side}, vy=${vy}, ${mechanismId}`);
  }
});
