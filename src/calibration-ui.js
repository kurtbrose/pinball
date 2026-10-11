import { calibrationSweep, setupShot } from './calibration.js';
import { DT } from './simulation.js';
import { render } from './renderer.js';
const shots=calibrationSweep();
const select=/** @type {HTMLSelectElement} */(document.querySelector('#shot'));
const results=/** @type {HTMLTableSectionElement} */(document.querySelector('#results'));
/** @param {number|null} value */
const format=value=>value===null?'—':value.toFixed(2);
shots.forEach((shot,i)=>{
  const name=`${shot.mode} · ${shot.fraction*100}% · incoming ${shot.incoming} m/s`;
  const option=document.createElement('option');option.value=String(i);option.textContent=name;select.append(option);
  const row=results.insertRow();
  for(const text of [`${shot.mode} / ${shot.fraction*100}%`,String(shot.incoming),format(shot.speed),format(shot.angle),format(shot.rise),format(shot.peakContactSpeed)])row.insertCell().textContent=text;
});
let sim=setupShot('servo',.25,0), last=0, elapsed=0;
function reset(){const s=shots[Number(select.value)];sim=setupShot(s.mode,s.fraction,s.incoming);elapsed=0;}
select.addEventListener('change',reset);document.querySelector('#run')?.addEventListener('click',reset);
const ctx=/** @type {CanvasRenderingContext2D} */(/** @type {HTMLCanvasElement} */(document.querySelector('#table')).getContext('2d'));
/** @param {number} time */
function frame(time){if(last)elapsed+=Math.min((time-last)/1000,.1);last=time;while(elapsed>=DT){if(sim.tick<600)sim.step({left:true});elapsed-=DT;}render(ctx,sim.snapshot(),false);requestAnimationFrame(frame);}
requestAnimationFrame(frame);
