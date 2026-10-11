import { table } from './table.js';
/** @param {CanvasRenderingContext2D} ctx @param {ReturnType<import('./simulation.js').Simulation['snapshot']>} state */
export function render(ctx, state) {
  ctx.save(); ctx.scale(100, 100);
  ctx.fillStyle = '#142b35'; ctx.fillRect(0, 0, 6, 10);
  ctx.strokeStyle = '#22414b'; ctx.lineWidth = 0.008;
  for (let y = 0.5; y < 10; y += 0.5) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(6,y); ctx.stroke(); }
  for (let x = 0.5; x < 6; x += 0.5) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,10); ctx.stroke(); }
  ctx.textAlign='center'; ctx.fillStyle='#42616a'; ctx.font='0.16px Arial'; ctx.fillText('F I R S T   C O N T A C T',3,3.3);
  ctx.beginPath(); ctx.arc(3,4.2,1.4,0,Math.PI*2); ctx.stroke();
  ctx.font='italic 0.65px Georgia'; ctx.fillStyle='#31515a'; ctx.fillText('01',3,4.4);
  ctx.lineCap='round'; ctx.lineJoin='round';
  for (const [a,b] of table.walls) {ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.strokeStyle='#6c8a91';ctx.lineWidth=.085;ctx.stroke();ctx.strokeStyle='#b6d0ce';ctx.lineWidth=.025;ctx.stroke();}
  for (const f of state.flippers) {
    ctx.save();ctx.translate(f.x,f.y);ctx.rotate(f.angle);ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(table.flipperLength,0);ctx.lineWidth=table.flipperRadius*2;ctx.strokeStyle='#f3b46d';ctx.shadowColor='#f3b46d';ctx.shadowBlur=12;ctx.stroke();ctx.shadowBlur=0;ctx.fillStyle='#203943';ctx.beginPath();ctx.arc(0,0,.055,0,Math.PI*2);ctx.fill();ctx.restore();
  }
  ctx.fillStyle='#73929a';ctx.font='0.12px Arial';ctx.fillText('D R A I N',3,9.5);
  if (!state.drained) {
    const b=state.ball;ctx.save();ctx.translate(b.x,b.y);ctx.shadowColor='#000';ctx.shadowBlur=8;ctx.shadowOffsetY=3;
    const g=ctx.createRadialGradient(-.045,-.05,.01,0,0,table.ballRadius);g.addColorStop(0,'#fff');g.addColorStop(.3,'#e5f2f3');g.addColorStop(.7,'#7a949f');g.addColorStop(1,'#283e4c');ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,table.ballRadius,0,Math.PI*2);ctx.fill();ctx.restore();
  }
  ctx.restore();
}
