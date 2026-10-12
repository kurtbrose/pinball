import test from 'node:test';
import assert from 'node:assert/strict';
import { Vec2 } from 'planck';
import { Simulation, replay } from '../src/simulation.js';
import { table,firstTable } from '../src/table.js';
import { Rules } from '../src/rules.js';
test('complete-table commands replay deterministically with scoring and game state',()=>{
  const commands=[{tick:0,input:{plunger:true}},{tick:60,input:{}},{tick:100,input:{left:true}},{tick:140,input:{right:true}},{tick:180,input:{}}];
  assert.deepEqual(replay(commands,1200,firstTable),replay(commands,1200,firstTable));
});
test('both inlanes admit the ball and deliver it past the slingshots',()=>{
  for(const x of [1.15,4.25]){
    const sim=new Simulation({},firstTable);sim.phase='playing';sim.ball.setPosition(Vec2(x,6.6));sim.ball.setLinearVelocity(Vec2(0,1));
    let exited=false;for(let i=0;i<360;i++){sim.step();if(sim.ball.getPosition().y>7.8)exited=true;}
    assert.ok(exited,`inlane at ${x} passes the ball`);
  }
});
test('table definitions control pivots, spawn, gravity and materials',()=>{
  const custom={...table,gravity:2,flippers:[{x:2,y:7,side:1}],spawn:{x:3,y:2,vx:0,vy:0},ballRadius:.2};
  const sim=new Simulation({},custom);
  assert.equal(sim.flippers.length,1);assert.equal(sim.flippers[0].body.getPosition().x,2);
  assert.equal(sim.ball.getPosition().y,2);assert.equal(sim.world.getGravity().y,2);
  assert.equal(sim.ball.getFixtureList().getRestitution(),custom.materials.ball.restitution);
});
test('plunges enter playfield and do not return to the shooter across charge levels',()=>{
  for(const actuation of ['servo','solenoid'])for(const charge of [1,15,30,45,60,75,90]){
    const sim=new Simulation({actuation},firstTable);
    for(let i=0;i<charge;i++)sim.step({plunger:true});
    sim.step();assert.equal(sim.phase,'playing');assert.ok(sim.ball.getLinearVelocity().y<0);
    let entered=false;
    for(let i=0;i<1200;i++){
      sim.step();if(sim.ball.getPosition().x<4.9&&sim.ball.getPosition().y<6)entered=true;
      assert.ok(!sim.events.some(e=>e.type==='ball.return'),`${actuation} charge ${charge} stays out of shooter`);
    }
    assert.ok(entered,`charge ${charge} enters playfield`);
  }
});
test('shooter gate passes upward balls and deflects downward balls left',()=>{
  const definition={...table,walls:[],gates:firstTable.gates,ballRadius:firstTable.ballRadius};
  const up=new Simulation({},definition);up.ball.setPosition(Vec2(5.38,2.3));up.ball.setLinearVelocity(Vec2(0,-6));
  for(let i=0;i<20;i++)up.step();
  assert.ok(up.ball.getPosition().y<1.5);assert.ok(up.ball.getLinearVelocity().y<0);assert.ok(Math.abs(up.ball.getPosition().x-5.38)<.01);
  const down=new Simulation({},definition);down.ball.setPosition(Vec2(5.38,1.2));down.ball.setLinearVelocity(Vec2(0,4));
  for(let i=0;i<30;i++)down.step();
  assert.ok(down.ball.getPosition().x<5.1);assert.ok(down.ball.getLinearVelocity().x<0);
});
test('quick plunger taps launch and shooter-lane returns allow another plunge',()=>{
  const sim=new Simulation({},firstTable);sim.step({plungerRelease:true});assert.equal(sim.phase,'playing');
  sim.ball.setPosition(Vec2(firstTable.spawn.x,9));sim.ball.setLinearVelocity(Vec2(0,1));sim.step();
  assert.equal(sim.phase,'ready');assert.equal(sim.ballNumber,1);assert.equal(sim.drains,0);
});
test('three drains end the game, reset starts a clean game',()=>{
  const sim=new Simulation({},firstTable);
  for(let ball=1;ball<=3;ball++){
    sim.phase='playing';sim.ball.setPosition(Vec2(3,11));sim.step();
    assert.equal(sim.drains,ball);assert.equal(sim.events[0].type,'ball.drain');
    if(ball<3){assert.equal(sim.phase,'draining');for(let i=0;i<91;i++)sim.step();assert.equal(sim.phase,'ready');assert.equal(sim.ballNumber,ball+1);}
  }
  assert.equal(sim.phase,'gameover');
  for(let i=0;i<200;i++)sim.step({plunger:true});assert.equal(sim.phase,'gameover');assert.equal(sim.drains,3);
  sim.step({reset:true});assert.equal(sim.phase,'ready');assert.equal(sim.drains,0);assert.equal(sim.ballNumber,1);assert.equal(sim.rules.score,0);
});
test('unattended launches naturally drain through a complete three-ball game',()=>{
  for(const actuation of ['servo','solenoid'])for(const held of [false,true]){
    const sim=new Simulation({actuation},firstTable);
    for(const charge of [0,45,90]){
      assert.equal(sim.phase,'ready');
      for(let i=0;i<charge;i++)sim.step({plunger:true});
      sim.step({plungerRelease:true});
      for(let i=0;i<7200&&sim.phase==='playing';i++)sim.step({left:held,right:held});
      // The opened guide exits permit deliberate raised-flipper catches.
      // Require a natural loss after release rather than forbidding a catch.
      if(held)for(let i=0;i<7200&&sim.phase==='playing';i++)sim.step();
      assert.ok(sim.phase==='draining'||sim.phase==='gameover',`${actuation}, held=${held}, charge=${charge} drains naturally, releasing any held catch`);
      while(sim.phase==='draining')sim.step();
    }
    assert.equal(sim.phase,'gameover');assert.equal(sim.drains,3);
  }
});
test('bumper emits an event, adds explicit kick and rules score separately',()=>{
  const isolated={...firstTable,mechanisms:firstTable.mechanisms.filter(m=>m.id==='pop-left'),walls:[]};
  const sim=new Simulation({},isolated);sim.phase='playing';
  sim.ball.setPosition(Vec2(2.57,2.7));sim.ball.setLinearVelocity(Vec2(-3,0));
  const events=[];for(let i=0;i<12;i++){sim.step();events.push(...sim.events);}
  assert.equal(events.filter(e=>e.id==='pop-left').length,1);
  assert.equal(sim.rules.score,100);assert.ok(sim.ball.getLinearVelocity().x>3);
  const rules=new Rules({'bumper.hit':7});rules.consume(events);assert.equal(rules.score,7);
});
test('rubber posts and slingshots emit their own events',()=>{
  for(const [id,x,y,vx,vy] of [['post-left',1.59,5.1,-3,0],['sling-left',2.5,6.95,-3,0],['sling-right',3.35,6.95,3,0]]){
    const isolated={...firstTable,mechanisms:firstTable.mechanisms.filter(m=>m.id===id),walls:[]};
    const sim=new Simulation({},isolated);sim.phase='playing';sim.ball.setPosition(Vec2(x,y));sim.ball.setLinearVelocity(Vec2(vx,vy));
    const events=[];for(let i=0;i<12;i++){sim.step();events.push(...sim.events);}
    assert.ok(events.some(e=>e.id===id),`${id} emits an event`);
    if(id.startsWith('sling-'))assert.ok(sim.ball.getLinearVelocity().y<0);
  }
});
