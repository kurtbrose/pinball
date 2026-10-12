import { World, Vec2, Edge, Circle, Box, Polygon, RevoluteJoint } from './physics.js';
import { table as prototypeTable } from './table.js';
import { Rules } from './rules.js';
export const DT = 1 / 120;
/** @typedef {{left?: boolean, right?: boolean, reset?: boolean, plunger?:boolean, plungerRelease?:boolean,nudge?:{x:number,y:number}}} Command */
export class Simulation {
  /** @param {{actuation?: 'servo'|'solenoid', isolated?: boolean}} [options] @param {typeof prototypeTable} [definition] */
  constructor(options = {}, definition = prototypeTable) {
    this.table=definition;
    const table=definition;
    this.isolated=options.isolated??false;
    this.rules=new Rules(table.points);
    this.ballNumber=1;
    this.phase=table.game.enabled&&!this.isolated?'ready':'playing';
    this.pullTicks=0;
    this.wasPulling=false;
    this.resetAt=0;
    /** @type {{type:string,id:string,tick:number}[]} */
    this.events=[];
    /** @type {typeof table.mechanisms} */
    this.pending=[];
    this.cooldowns=/** @type {Map<string,number>} */(new Map());
    this.actuation = options.actuation ?? 'servo';
    this.tick = 0;
    this.nudgeHeld=false;
    this.nextNudgeTick=0;
    this.drains = 0;
    this.drained = false;
    this.world = new World(Vec2(0, table.gravity));
    const ground = this.world.createBody();
    for (const [a, b] of options.isolated ? [] : table.walls) {
      ground.createFixture(new Edge(Vec2(a[0], a[1]), Vec2(b[0], b[1])), table.materials.wall);
    }
    for(const guide of options.isolated?[]:table.guides??[]){
      ground.createFixture(new Edge(Vec2(guide.a[0],guide.a[1]),Vec2(guide.b[0],guide.b[1])),{...table.materials.wall,restitution:guide.restitution,userData:{guide}});
    }
    this.flippers = table.flippers.map(({x,y,side}) => {
      const angle = side === 1 ? table.restAngle : Math.PI - table.restAngle;
      const body = this.world.createDynamicBody({ position: Vec2(x, y), angle });
      const length = table.flipperLength;
      body.createFixture(new Box(length / 2, table.flipperRadius, Vec2(length / 2, 0)), table.materials.flipper);
      for (const end of [0, length]) body.createFixture(new Circle(Vec2(end, 0), table.flipperRadius), table.materials.flipper);
      const travel = table.restAngle - table.raisedAngle;
      const joint = new RevoluteJoint({ enableMotor: true, maxMotorTorque: table.motorTorque, enableLimit: true, lowerAngle: side === 1 ? -travel : 0, upperAngle: side === 1 ? 0 : travel }, ground, body, Vec2(x, y));
      this.world.createJoint(joint);
      return { body, joint, side, holding: false };
    });
    this.ball = this.world.createDynamicBody({ position: Vec2(table.spawn.x,table.spawn.y), bullet: true, linearDamping:table.damping.linear, angularDamping:table.damping.angular });
    this.ball.createFixture(new Circle(table.ballRadius), table.materials.ball);
    for(const gate of this.isolated?[]:table.gates){
      ground.createFixture(new Edge(Vec2(gate.a[0],gate.a[1]),Vec2(gate.b[0],gate.b[1])),{...table.materials.wall,userData:{gate}});
    }
    this.world.on('pre-solve',contact=>{
      const a=contact.getFixtureA(),b=contact.getFixtureB();
      const fixture=a.getBody()===this.ball?b:b.getBody()===this.ball?a:null;
      const data=/** @type {{gate?:typeof table.gates[number],guide?:typeof table.guides[number]}|undefined} */(fixture?.getUserData());
      // Planck normally mixes restitution by maximum; the ball's rubber-like
      // baseline must not turn a deliberately passive guide into a trampoline.
      if(data?.guide)contact.setRestitution(data.guide.restitution);
      if(data?.gate){
        const velocity=this.ball.getLinearVelocity(),direction=data.gate.allowedDirection;
        contact.setEnabled(velocity.x*direction[0]+velocity.y*direction[1]<=0);
      }
    });
    this.mechanisms=this.isolated?[]:table.mechanisms;
    for(const mechanism of this.mechanisms){
      const body=this.world.createBody();
      const shape=mechanism.vertices?new Polygon(mechanism.vertices.map(([x,y])=>Vec2(x,y))):new Circle(Vec2(mechanism.x,mechanism.y),mechanism.radius);
      body.createFixture(shape,{...table.materials.rubber,userData:mechanism});
    }
    this.world.on('begin-contact',contact=>{
      const a=contact.getFixtureA(),b=contact.getFixtureB();
      const fixture=a.getBody()===this.ball?b:b.getBody()===this.ball?a:null;
      const mechanism=/** @type {typeof table.mechanisms[number]|undefined} */(fixture?.getUserData());
      if(mechanism?.id && this.phase==='playing')this.pending.push(mechanism);
    });
    this.resetBall();
  }
  resetBall() {
    const table=this.table;
    this.ball.setTransform(Vec2(table.spawn.x,table.spawn.y), 0);
    this.ball.setLinearVelocity(Vec2(table.spawn.vx,table.spawn.vy));
    this.ball.setAngularVelocity(0);
    this.ball.setAwake(true);
    this.drained = false;
    this.pullTicks=0;this.wasPulling=false;
    this.phase=table.game.enabled&&!this.isolated?'ready':'playing';
  }
  /** @param {Command} [input] */
  step(input = {}) {
    const nudge=input.nudge;
    if(nudge&&(!Number.isFinite(nudge.x)||!Number.isFinite(nudge.y)||Math.hypot(nudge.x,nudge.y)>1+1e-12))throw new Error('Nudge must be a finite vector of magnitude at most 1');
    const table=this.table;
    this.events=[];
    if (input.reset) {this.rules.score=0;this.drains=0;this.ballNumber=1;this.cooldowns.clear();this.nextNudgeTick=0;this.resetBall();}
    if(this.phase==='draining' && this.tick>=this.resetAt){this.ballNumber++;this.resetBall();}
    if(this.phase==='ready'){
      if(input.plunger)this.pullTicks=Math.min(table.plunger.maxPullTicks,this.pullTicks+1);
      if((this.wasPulling&&!input.plunger)||input.plungerRelease){
        const speed=table.plunger.minSpeed+(table.plunger.maxSpeed-table.plunger.minSpeed)*this.pullTicks/table.plunger.maxPullTicks;
        this.ball.setLinearVelocity(Vec2(0,-speed));this.phase='playing';this.events.push({type:'ball.launch',id:'plunger',tick:this.tick});this.pullTicks=0;
      }
      this.wasPulling=!!input.plunger;
    }
    this.flippers.forEach((flipper, index) => {
      const { joint, side } = flipper;
      const pressed = index === 0 ? input.left : input.right;
      const target = pressed ? -side * (table.restAngle - table.raisedAngle) : 0;
      const speed = pressed ? table.motorSpeed : table.returnSpeed;
      if (this.actuation === 'solenoid') {
        if (!pressed) flipper.holding = false;
        else if (Math.abs(target - joint.getJointAngle()) < table.endStrokeAngle) flipper.holding = true;
        joint.setMaxMotorTorque(pressed ? (flipper.holding ? table.holdTorque : table.motorTorque) : table.returnTorque);
        // Torque-limited drive into the native mechanical stop. No approach servo.
        joint.setMotorSpeed(side * (pressed ? -table.motorSpeed : table.returnSpeed));
      } else {
        joint.setMaxMotorTorque(table.motorTorque);
        joint.setMotorSpeed(Math.max(-speed, Math.min(speed, (target - joint.getJointAngle()) * 60)));
      }
    });
    const nudging=!!nudge&&(nudge.x!==0||nudge.y!==0);
    if(nudging&&!this.nudgeHeld&&this.tick>=this.nextNudgeTick&&this.phase==='playing'&&!this.drained&&!this.isolated&&table.nudge.velocity>0){
      // Effective ball velocity relative to the table; fixtures remain fixed.
      this.ball.applyLinearImpulse(Vec2(nudge.x*table.nudge.velocity*this.ball.getMass(),nudge.y*table.nudge.velocity*this.ball.getMass()),this.ball.getWorldCenter(),true);
      this.nextNudgeTick=this.tick+table.nudge.cooldownTicks;
      this.events.push({type:'table.nudge',id:'nudge',tick:this.tick});
    }
    this.nudgeHeld=nudging;
    this.world.step(DT, 10, 4);
    for(const mechanism of this.pending){
      if(this.tick<(this.cooldowns.get(mechanism.id)??0))continue;
      this.cooldowns.set(mechanism.id,this.tick+12);
      this.events.push({type:`${mechanism.type}.hit`,id:mechanism.id,tick:this.tick});
      if(mechanism.kick){
        const p=this.ball.getPosition();const d=mechanism.direction??[p.x-mechanism.x,p.y-mechanism.y];const length=Math.hypot(d[0],d[1])||1;
        this.ball.applyLinearImpulse(Vec2(d[0]/length*mechanism.kick*this.ball.getMass(),d[1]/length*mechanism.kick*this.ball.getMass()),this.ball.getWorldCenter(),true);
      }
    }
    this.pending=[];this.rules.consume(this.events);
    const position=this.ball.getPosition();
    if(table.game.enabled&&!this.isolated&&this.phase==='playing'&&position.x>table.spawn.x-.2&&position.y>table.spawn.y&&this.ball.getLinearVelocity().y>0){
      this.resetBall();this.events.push({type:'ball.return',id:'plunger',tick:this.tick});
    }
    this.tick++;
    if (!this.drained && this.ball.getPosition().y > table.game.drainY) {
      this.drained = true;
      this.drains++;
      this.ball.setLinearVelocity(Vec2(0, 0));
      this.ball.setAwake(false);
      this.events.push({type:'ball.drain',id:'drain',tick:this.tick});
      if(table.game.enabled&&!this.isolated){this.phase=this.ballNumber>=table.game.balls?'gameover':'draining';this.resetAt=this.tick+table.game.resetDelay;}
    }
  }
  snapshot() {
    const p = this.ball.getPosition();
    return { table:this.table, tick: this.tick, drains: this.drains, drained: this.drained,score:this.rules.score,ballNumber:this.ballNumber,phase:this.phase,pull:this.pullTicks/this.table.plunger.maxPullTicks,activations:Object.fromEntries(this.cooldowns),events:this.events.map(e=>({...e})),ball: { x: p.x, y: p.y, angle: this.ball.getAngle() }, flippers: this.flippers.map(({ body }) => ({ x: body.getPosition().x, y: body.getPosition().y, angle: body.getAngle() })) };
  }
}
/** @param {{tick: number, input: Command}[]} commands @param {number} ticks @param {typeof prototypeTable} [definition] @param {{actuation?: 'servo'|'solenoid'}} [options] */
export function replay(commands, ticks, definition = prototypeTable, options = {}) {
  const sim = new Simulation(options,definition);
  let input = {};
  for (let tick = 0; tick < ticks; tick++) {
    for (const command of commands) if (command.tick === tick) input = command.input;
    sim.step(input);
  }
  return sim.snapshot();
}
