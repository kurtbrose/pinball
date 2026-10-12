/** @param {CanvasRenderingContext2D} ctx @param {ReturnType<import('./simulation.js').Simulation['snapshot']>} state @param {boolean} [showWalls] */
export function render(ctx, state, showWalls = true) {
  const table=state.table;
  ctx.save(); ctx.scale(ctx.canvas.width/table.width,ctx.canvas.height/table.height);
  ctx.fillStyle = '#142b35'; ctx.fillRect(0, 0, table.width, table.height);
  ctx.strokeStyle = '#22414b'; ctx.lineWidth = 0.008;
  for (let y = 0.5; y < table.height; y += 0.5) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(table.width,y); ctx.stroke(); }
  for (let x = 0.5; x < table.width; x += 0.5) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,table.height); ctx.stroke(); }
  ctx.textAlign='center'; ctx.fillStyle='#42616a'; ctx.font='0.16px Arial'; ctx.fillText('F I R S T   C O N T A C T',3,3.3);
  ctx.beginPath(); ctx.arc(3,4.2,1.4,0,Math.PI*2); ctx.stroke();
  ctx.font='italic 0.65px Georgia'; ctx.fillStyle='#31515a'; ctx.fillText('01',3,4.4);
  ctx.lineCap='round'; ctx.lineJoin='round';
  if(showWalls)for(const m of table.mechanisms){
    const active=state.tick<(state.activations[m.id]??0);
    ctx.fillStyle=active?'#fff2c7':m.type==='bumper'?'#d18b54':m.type==='sling'?'#2d746e':'#7ab4af';
    ctx.strokeStyle='#b6d0ce';ctx.lineWidth=.035;ctx.beginPath();
    if(m.vertices){m.vertices.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();}
    else ctx.arc(m.x,m.y,m.radius,0,Math.PI*2);
    ctx.fill();ctx.stroke();
    if(m.type==='sling'&&m.activeNormal&&m.vertices){
      // The long inward rubber face is active; the inlane border stays passive.
      const vertices=m.vertices;
      const edges=vertices.map((a,i)=>({a,b:vertices[(i+1)%vertices.length]}));
      const face=edges.reduce((best,edge)=>Math.hypot(edge.b[0]-edge.a[0],edge.b[1]-edge.a[1])>Math.hypot(best.b[0]-best.a[0],best.b[1]-best.a[1])?edge:best);
      ctx.beginPath();ctx.moveTo(face.a[0],face.a[1]);ctx.lineTo(face.b[0],face.b[1]);ctx.strokeStyle=active?'#fff2c7':'#f3b46d';ctx.lineWidth=.055;ctx.stroke();
    }
    if(m.type==='bumper'){ctx.beginPath();ctx.arc(m.x,m.y,m.radius*.65,0,Math.PI*2);ctx.stroke();ctx.fillStyle='#142b35';ctx.font='.13px Arial';ctx.fillText('100',m.x,m.y+.04);}
  }
  for (const [a,b] of showWalls ? [...table.walls,...(table.guides??[]).map(g=>[g.a,g.b])] : []) {ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.strokeStyle='#6c8a91';ctx.lineWidth=.085;ctx.stroke();ctx.strokeStyle='#b6d0ce';ctx.lineWidth=.025;ctx.stroke();}
  if(showWalls)for(const gate of table.gates){ctx.beginPath();ctx.moveTo(gate.a[0],gate.a[1]);ctx.lineTo(gate.b[0],gate.b[1]);ctx.lineWidth=.045;ctx.strokeStyle='#f3b46d';ctx.stroke();}
  for (const f of state.flippers) {
    ctx.save();ctx.translate(f.x,f.y);ctx.rotate(f.angle);ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(table.flipperLength,0);ctx.lineWidth=table.flipperRadius*2;ctx.strokeStyle='#f3b46d';ctx.shadowColor='#f3b46d';ctx.shadowBlur=12;ctx.stroke();ctx.shadowBlur=0;ctx.fillStyle='#203943';ctx.beginPath();ctx.arc(0,0,.055,0,Math.PI*2);ctx.fill();ctx.restore();
  }
  ctx.fillStyle='#73929a';ctx.font='0.12px Arial';ctx.fillText('D R A I N',3,9.5);
  if(table.game.enabled&&showWalls){ctx.strokeStyle='#f3b46d';ctx.lineWidth=.09;ctx.beginPath();ctx.moveTo(table.spawn.x,9.18);ctx.lineTo(table.spawn.x,9.7+state.pull*.2);ctx.stroke();}
  if (!state.drained) {
    const b=state.ball;ctx.save();ctx.translate(b.x,b.y);ctx.shadowColor='#000';ctx.shadowBlur=8;ctx.shadowOffsetY=3;
    const g=ctx.createRadialGradient(-.045,-.05,.01,0,0,table.ballRadius);g.addColorStop(0,'#fff');g.addColorStop(.3,'#e5f2f3');g.addColorStop(.7,'#7a949f');g.addColorStop(1,'#283e4c');ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,table.ballRadius,0,Math.PI*2);ctx.fill();ctx.restore();
  }
  ctx.restore();
}
