import { Simulation, DT } from './simulation.js';
import { render } from './renderer.js';
import { firstTable } from './table.js';
const canvas = /** @type {HTMLCanvasElement} */ (document.querySelector('#table'));
const ctx = /** @type {CanvasRenderingContext2D} */ (canvas.getContext('2d'));
const actuation = new URLSearchParams(location.search).get('actuation')==='solenoid'?'solenoid':'servo';
const sim = new Simulation({actuation},firstTable);
const diagnostics=document.createElement('p');
const calibrationLink=document.createElement('a');calibrationLink.href='calibration.html';calibrationLink.textContent='Flipper calibration →';
calibrationLink.style.color='#f6ba72';diagnostics.append(calibrationLink);
const comparison=document.createElement('a');comparison.href=actuation==='servo'?'?actuation=solenoid':'./';comparison.textContent=actuation==='servo'?'Try stroke / hold actuation →':'Return to servo actuation →';comparison.style.color='#f6ba72';
diagnostics.append(document.createElement('br'),comparison);document.querySelector('.intro')?.append(diagnostics);
const labLink=document.createElement('a');labLink.href='shot-lab.html';labLink.textContent='Shot laboratory →';labLink.style.color='#f6ba72';diagnostics.append(document.createElement('br'),labLink);
const input = { left: false, right: false, reset: false,plunger:false,plungerRelease:false };
/** Tick-stamped full input snapshots, available for debugging. */
const recording = [];
/** @param {KeyboardEvent} event @param {boolean} pressed */
function key(event, pressed) {
  if (['ArrowLeft','ArrowRight','Space','KeyA','KeyD'].includes(event.code)) event.preventDefault();
  if (event.code==='KeyA'||event.code==='ArrowLeft') input.left=pressed;
  if (event.code==='KeyD'||event.code==='ArrowRight') input.right=pressed;
  if (event.code==='Space'){if(!pressed&&input.plunger)input.plungerRelease=true;input.plunger=pressed;}
  if (event.code==='KeyR' && pressed && !event.repeat) input.reset=true;
}
addEventListener('keydown', e=>key(e,true));addEventListener('keyup',e=>key(e,false));
addEventListener('blur',()=>{input.left=false;input.right=false;input.plunger=false;});
document.querySelector('#reset')?.addEventListener('click',()=>{input.reset=true;});
for (const side of /** @type {const} */ (['left','right','plunger'])) {
  const button=/** @type {HTMLButtonElement} */(document.querySelector('#'+side));
  button.addEventListener('pointerdown',e=>{button.setPointerCapture(e.pointerId);input[side]=true;});
  for(const event of ['pointerup','pointercancel','lostpointercapture']) button.addEventListener(event,()=>{if(side==='plunger'&&input.plunger)input.plungerRelease=true;input[side]=false;});
}
let last=0, accumulator=0, previous='';
/** @param {number} now */
function frame(now) {
  if(last) accumulator+=Math.min((now-last)/1000,.1);
  last=now;
  while(accumulator>=DT){
    const encoded=JSON.stringify(input);
    if(encoded!==previous){recording.push({tick:sim.tick,input:{...input}});previous=encoded;}
    sim.step(input);input.reset=false;input.plungerRelease=false;accumulator-=DT;
  }
  const state=sim.snapshot(); render(ctx,state);
  const score=document.querySelector('#score');if(score)score.textContent=state.score.toLocaleString();
  const ball=document.querySelector('#ball');if(ball)ball.textContent=`${state.ballNumber} / ${firstTable.game.balls}`;
  const status=document.querySelector('#status');if(status) status.textContent=state.phase==='ready'?(input.plunger?`Plunger ${Math.round(state.pull*100)}% · release to launch`:'Hold Space to pull · release to launch'):state.phase==='gameover'?'Game over · press R for a new game':state.phase==='draining'?'Drained · next ball loading':'Ball in play';
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
