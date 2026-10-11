import { Simulation, DT } from './simulation.js';
import { render } from './renderer.js';
const canvas = /** @type {HTMLCanvasElement} */ (document.querySelector('#table'));
const ctx = /** @type {CanvasRenderingContext2D} */ (canvas.getContext('2d'));
const sim = new Simulation();
const input = { left: false, right: false, reset: false };
/** Tick-stamped full input snapshots, available for debugging. */
const recording = [];
/** @param {KeyboardEvent} event @param {boolean} pressed */
function key(event, pressed) {
  if (['ArrowLeft','ArrowRight','Space','KeyA','KeyD'].includes(event.code)) event.preventDefault();
  if (event.code==='KeyA'||event.code==='ArrowLeft') input.left=pressed;
  if (event.code==='KeyD'||event.code==='ArrowRight') input.right=pressed;
  if (event.code==='Space' && pressed && !event.repeat) input.reset=true;
}
addEventListener('keydown', e=>key(e,true));addEventListener('keyup',e=>key(e,false));
addEventListener('blur',()=>{input.left=false;input.right=false;});
document.querySelector('#reset')?.addEventListener('click',()=>{input.reset=true;});
for (const side of /** @type {const} */ (['left','right'])) {
  const button=/** @type {HTMLButtonElement} */(document.querySelector('#'+side));
  button.addEventListener('pointerdown',e=>{button.setPointerCapture(e.pointerId);input[side]=true;});
  for(const event of ['pointerup','pointercancel','lostpointercapture']) button.addEventListener(event,()=>{input[side]=false;});
}
let last=0, accumulator=0, previous='';
/** @param {number} now */
function frame(now) {
  if(last) accumulator+=Math.min((now-last)/1000,.1);
  last=now;
  while(accumulator>=DT){
    const encoded=JSON.stringify(input);
    if(encoded!==previous){recording.push({tick:sim.tick,input:{...input}});previous=encoded;}
    sim.step(input);input.reset=false;accumulator-=DT;
  }
  const state=sim.snapshot(); render(ctx,state);
  const drains=document.querySelector('#drains');if(drains) drains.textContent=String(state.drains).padStart(2,'0');
  const status=document.querySelector('#status');if(status) status.textContent=state.drained?'Drained · press Space for a fresh ball':'Ball in play';
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
