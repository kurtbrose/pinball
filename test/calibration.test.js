import test from 'node:test';
import assert from 'node:assert/strict';
import { calibrationSweep, measureShot, setupShot } from '../src/calibration.js';
test('calibration sweep is repeatable and shots contact and separate',()=>{
  const shots=calibrationSweep();assert.deepEqual(shots,calibrationSweep());assert.equal(shots.length,16);
  for(const shot of shots){assert.ok(shot.contactTick>=0);assert.ok(shot.outgoing);assert.ok(Number.isFinite(shot.speed));}
});
test('stationary tip and heel shots have distinct trajectories',()=>{
  const heel=measureShot('solenoid',.25,0),tip=measureShot('solenoid',.9,0);
  assert.notEqual(heel.speed,tip.speed);assert.notEqual(heel.angle,tip.angle);
});
test('solenoid switches to reduced holding torque and releases',()=>{
  const sim=setupShot('solenoid',.5,0);
  for(let i=0;i<120;i++)sim.step({left:true});
  assert.equal(sim.flippers[0].holding,true);
  assert.ok(Math.abs(sim.flippers[0].body.getAngle()+.5)<.05);
  for(let i=0;i<120;i++)sim.step();
  assert.equal(sim.flippers[0].holding,false);
  assert.ok(Math.abs(sim.flippers[0].body.getAngle()-.42)<.05);
});
