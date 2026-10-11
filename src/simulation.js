import { World, Vec2, Edge, Circle, Box, RevoluteJoint } from 'planck';
import { table } from './table.js';
export const DT = 1 / 120;
/** @typedef {{left?: boolean, right?: boolean, reset?: boolean}} Command */
export class Simulation {
  constructor() {
    this.tick = 0;
    this.drains = 0;
    this.drained = false;
    this.world = new World(Vec2(0, table.gravity));
    const ground = this.world.createBody();
    for (const [a, b] of table.walls) {
      ground.createFixture(new Edge(Vec2(a[0], a[1]), Vec2(b[0], b[1])), { friction: 0.15, restitution: 0.65 });
    }
    this.flippers = [1, -1].map((side) => {
      const x = side === 1 ? 1.65 : 4.35;
      const angle = side === 1 ? table.restAngle : Math.PI - table.restAngle;
      const body = this.world.createDynamicBody({ position: Vec2(x, table.flipperY), angle });
      const length = table.flipperLength;
      body.createFixture(new Box(length / 2, table.flipperRadius, Vec2(length / 2, 0)), { density: 8, friction: 0.35, restitution: 0.45 });
      for (const end of [0, length]) body.createFixture(new Circle(Vec2(end, 0), table.flipperRadius), { density: 8, friction: 0.35, restitution: 0.45 });
      const travel = table.restAngle - table.raisedAngle;
      const joint = new RevoluteJoint({ enableMotor: true, maxMotorTorque: table.motorTorque, enableLimit: true, lowerAngle: side === 1 ? -travel : 0, upperAngle: side === 1 ? 0 : travel }, ground, body, Vec2(x, table.flipperY));
      this.world.createJoint(joint);
      return { body, joint, side };
    });
    this.ball = this.world.createDynamicBody({ position: Vec2(2.4, 1.5), bullet: true, linearDamping: 0.025, angularDamping: 0.02 });
    this.ball.createFixture(new Circle(table.ballRadius), { density: 7.8, friction: 0.18, restitution: 0.5 });
    this.resetBall();
  }
  resetBall() {
    this.ball.setTransform(Vec2(2.4, 1.5), 0);
    this.ball.setLinearVelocity(Vec2(1.15, 0));
    this.ball.setAngularVelocity(0);
    this.ball.setAwake(true);
    this.drained = false;
  }
  /** @param {Command} [input] */
  step(input = {}) {
    if (input.reset) this.resetBall();
    this.flippers.forEach(({ joint, side }, index) => {
      const pressed = index === 0 ? input.left : input.right;
      const target = pressed ? -side * (table.restAngle - table.raisedAngle) : 0;
      const speed = pressed ? table.motorSpeed : table.returnSpeed;
      // Brake at the stop rather than driving into it at full speed.
      joint.setMotorSpeed(Math.max(-speed, Math.min(speed, (target - joint.getJointAngle()) * 60)));
    });
    this.world.step(DT, 10, 4);
    this.tick++;
    if (!this.drained && this.ball.getPosition().y > table.height + 0.3) {
      this.drained = true;
      this.drains++;
      this.ball.setLinearVelocity(Vec2(0, 0));
      this.ball.setAwake(false);
    }
  }
  snapshot() {
    const p = this.ball.getPosition();
    return { tick: this.tick, drains: this.drains, drained: this.drained, ball: { x: p.x, y: p.y, angle: this.ball.getAngle() }, flippers: this.flippers.map(({ body }) => ({ x: body.getPosition().x, y: body.getPosition().y, angle: body.getAngle() })) };
  }
}
/** @param {{tick: number, input: Command}[]} commands @param {number} ticks */
export function replay(commands, ticks) {
  const sim = new Simulation();
  let input = {};
  for (let tick = 0; tick < ticks; tick++) {
    for (const command of commands) if (command.tick === tick) input = command.input;
    sim.step(input);
  }
  return sim.snapshot();
}
