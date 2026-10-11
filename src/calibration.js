import { Vec2 } from 'planck';
import { Simulation, DT } from './simulation.js';
import { table } from './table.js';
/** @param {import('planck').Contact} contact @param {import('planck').Body} ball @param {import('planck').Body} flipper */
export function isBallFlipperContact(contact,ball,flipper){
  const a=contact.getFixtureA().getBody(),b=contact.getFixtureB().getBody();
  return (a===ball&&b===flipper)||(b===ball&&a===flipper);
}
/** @param {'servo'|'solenoid'} mode @param {number} fraction @param {number} incoming @param {'launch'|'midstroke'|'raised'} [timing] */
export function setupShot(mode, fraction, incoming, timing='launch') {
  const sim = new Simulation({actuation:mode, isolated:true});
  // Remove the other flipper: this fixture measures one actuator, not a table shot.
  sim.world.destroyBody(sim.flippers[1].body);
  sim.flippers.splice(1,1);
  const f=sim.flippers[0];
  if(timing!=='launch'){
    sim.ball.setPosition(Vec2(-100,-100));
    const halfway=(table.restAngle+table.raisedAngle)/2;
    for(let i=0;i<60;i++){sim.step({left:true});if(timing==='midstroke'&&f.body.getAngle()<=halfway)break;}
  }
  const angle=f.body.getAngle(), distance=fraction*table.flipperLength;
  const gap=table.flipperRadius+table.ballRadius+0.005;
  sim.ball.setPosition(Vec2(f.body.getPosition().x+distance*Math.cos(angle)+gap*Math.sin(angle), f.body.getPosition().y+distance*Math.sin(angle)-gap*Math.cos(angle)));
  sim.ball.setLinearVelocity(Vec2(-incoming*Math.sin(angle),incoming*Math.cos(angle)));
  sim.ball.setAngularVelocity(0);
  return sim;
}
/** @param {'servo'|'solenoid'} mode @param {number} fraction @param {number} incoming @param {'launch'|'midstroke'|'raised'} [timing] */
export function measureShot(mode, fraction, incoming, timing='launch') {
  const sim=setupShot(mode,fraction,incoming,timing);
  const startTick=sim.tick;
  const startY=sim.ball.getPosition().y;
  let contactTick=-1, contactSpeed=0, peakContactSpeed=0, lastImpact=-1;
  /** @type {{x:number,y:number}|null} */
  let outgoing=null;
  let flightTop=startY, separationY=startY, ended=false;
  sim.world.on('post-solve',(contact,impulse)=>{
    if(!isBallFlipperContact(contact,sim.ball,sim.flippers[0].body))return;
    if(!impulse.normalImpulses.some(value=>value>1e-8))return;
    if(outgoing){ended=true;return;}
    const speed=sim.flippers[0].body.getAngularVelocity();
    if(contactTick<0){contactTick=sim.tick;contactSpeed=speed;}
    peakContactSpeed=Math.max(peakContactSpeed,Math.abs(speed));lastImpact=sim.tick;
  });
  for(let i=0;i<600;i++) {
    sim.step({left:true});
    // Ignore brief separations between capsule fixtures and early bounce/recontact.
    if(lastImpact>=0 && i>=15 && sim.tick-lastImpact>=4 && !outgoing){const v=sim.ball.getLinearVelocity();outgoing={x:v.x,y:v.y};separationY=sim.ball.getPosition().y;flightTop=separationY;}
    if(outgoing && !ended){flightTop=Math.min(flightTop,sim.ball.getPosition().y);if(sim.ball.getLinearVelocity().y>=0)break;}
    if(ended || sim.drained)break;
  }
  return {mode,fraction,incoming,timing,contactTick,contactTime:contactTick<0?null:(contactTick-startTick)*DT,contactSpeed,peakContactSpeed,outgoing,
    speed:outgoing?Math.hypot(outgoing.x,outgoing.y):null,
    angle:outgoing?Math.atan2(-outgoing.y,outgoing.x)*180/Math.PI:null,
    rise:outgoing?Math.max(0,separationY-flightTop):null};
}
export function calibrationSweep() {
  return /** @type {const} */ (['servo','solenoid']).flatMap(mode=>[
    ...[0,3].flatMap(incoming=>[.25,.5,.75,.9].map(fraction=>measureShot(mode,fraction,incoming))),
    measureShot(mode,.5,3,'midstroke'),measureShot(mode,.5,3,'raised'),
  ]);
}
