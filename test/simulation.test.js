import test from 'node:test';
import assert from 'node:assert/strict';
import { Vec2 } from 'planck';
import { Simulation, replay } from '../src/simulation.js';
test('identical tick inputs reproduce the same state',()=>{
  const commands=[{tick:40,input:{left:true}},{tick:100,input:{right:true}},{tick:180,input:{}}];
  assert.deepEqual(replay(commands,500),replay(commands,500));
});
test('powered flippers reach raised and rest limits',()=>{
  const sim=new Simulation();
  for(let i=0;i<60;i++)sim.step({left:true,right:true});
  assert.ok(Math.abs(sim.flippers[0].body.getAngle()+.5)<.05);
  assert.ok(Math.abs(sim.flippers[1].body.getAngle()-(Math.PI+.5))<.05);
  for(let i=0;i<60;i++)sim.step();
  assert.ok(Math.abs(sim.flippers[0].body.getAngle()-.42)<.05);
});
test('flippers snap up within 100 ms and settle without large overshoot',()=>{
  const sim=new Simulation();
  for(let i=0;i<12;i++) {
    sim.step({left:true,right:true});
    assert.ok(sim.flippers[0].body.getAngle()>=-.55);
    assert.ok(sim.flippers[1].body.getAngle()<=Math.PI+.55);
  }
  assert.ok(Math.abs(sim.flippers[0].body.getAngle()+.5)<.04);
  assert.ok(Math.abs(sim.flippers[1].body.getAngle()-(Math.PI+.5))<.04);
});
test('fast ball rebounds from wall without tunneling',()=>{
  const sim=new Simulation();sim.ball.setPosition(Vec2(1,4));sim.ball.setLinearVelocity(Vec2(-35,0));
  for(let i=0;i<6;i++)sim.step();
  assert.ok(sim.ball.getPosition().x>.35);assert.ok(sim.ball.getLinearVelocity().x>0);
});
test('flipper contact drives a falling ball upward',()=>{
  const sim=new Simulation();sim.ball.setPosition(Vec2(2.35,8.15));sim.ball.setLinearVelocity(Vec2(0,2));
  let upward=false;
  for(let i=0;i<24;i++){sim.step({left:true});if(sim.ball.getLinearVelocity().y < -2)upward=true;}
  assert.ok(upward);
});
test('drain counts once and reset creates a playable ball',()=>{
  const sim=new Simulation();sim.ball.setPosition(Vec2(3,10.4));sim.step();sim.step();
  assert.equal(sim.drains,1);assert.equal(sim.drained,true);
  sim.step({reset:true});assert.equal(sim.drained,false);assert.ok(sim.ball.getPosition().y<2);
});
