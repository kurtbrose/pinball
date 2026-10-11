import { firstTable } from './table.js';
import { shotPresets } from './shot-presets.js';
import { render } from './renderer.js';
/** @typedef {ReturnType<import('./shot-lab.js').runShot>} ShotResult */
/** @typedef {ReturnType<import('./shot-lab.js').searchTimings>[number]} Trial */
const editor=/** @type {HTMLTextAreaElement} */(document.querySelector('#scenario'));
const preset=/** @type {HTMLSelectElement} */(document.querySelector('#preset'));
const side=/** @type {HTMLSelectElement} */(document.querySelector('#side'));
const scrub=/** @type {HTMLInputElement} */(document.querySelector('#scrub'));
const heat=/** @type {HTMLInputElement} */(document.querySelector('#heat'));
const paths=/** @type {HTMLInputElement} */(document.querySelector('#paths'));
const canvas=/** @type {HTMLCanvasElement} */(document.querySelector('#view'));
const ctx=/** @type {CanvasRenderingContext2D} */(canvas.getContext('2d'));
const status=/** @type {HTMLElement} */(document.querySelector('#status'));
/** @type {Worker|null} */let worker=null;
/** @type {ShotResult|null} */let selected=null;
/** @type {Trial[]} */let trials=[];
/** @type {unknown} */let report=null;
/** @param {boolean} running */
function busy(running){for(const id of ['run','search'])/** @type {HTMLButtonElement} */(document.getElementById(id)).disabled=running;/** @type {HTMLButtonElement} */(document.querySelector('#cancel')).disabled=!running;}
function loadPreset(){
  const {table,...spec}=shotPresets[preset.value];editor.value=JSON.stringify({...spec,actuation:'servo'},null,2);side.value=preset.value==='right'?'right':'left';
}
/** @param {'shot'|'search'} mode */
function run(mode){
  try{
    let parsed=JSON.parse(editor.value);parsed=parsed.config??parsed.result?.config??parsed;
    const spec={table:firstTable,...parsed};
    worker?.terminate();worker=new Worker(new URL('./shot-lab-worker.js',import.meta.url),{type:'module'});
    busy(true);status.textContent=mode==='shot'?'Running shot…':'Searching 25 timings…';
    worker.onerror=()=>{status.textContent='Worker failed to load or execute. Check the browser console.';busy(false);worker?.terminate();};
    worker.onmessage=event=>{
      const message=event.data;
      if(message.type==='ready'){worker?.postMessage({spec,mode,side:side.value});return;}
      if(message.type==='progress'){status.textContent=`Searching timings: ${message.completed} / ${message.total}`;return;}
      busy(false);worker?.terminate();worker=null;
      if(message.type==='error'){status.textContent=message.message;return;}
      report=message.report;
      trials=message.report.kind==='timing-search'?message.report.trials:[];
      selected=trials.length?trials[0].result:message.report.result;
      status.textContent=trials.length?`${trials.filter(t=>t.result.metrics.targetReached).length} / ${trials.length} timings reached the target.`:'Shot complete. Scrub the trajectory to inspect it.';
      /** @type {HTMLButtonElement} */(document.querySelector('#download')).disabled=false;
      buildTimings();showResult();
    };
  }catch(error){status.textContent=error instanceof Error?error.message:String(error);busy(false);}
}
function buildTimings(){
  const container=/** @type {HTMLElement} */(document.querySelector('#timings'));container.replaceChildren();
  for(const trial of trials){const button=document.createElement('button');button.textContent=`${trial.delay} ticks`;button.classList.toggle('success',!!trial.result.metrics.targetReached);button.classList.toggle('selected',selected===trial.result);button.addEventListener('click',()=>{selected=trial.result;buildTimings();showResult();});container.append(button);}
  if(!trials.length)container.textContent='Run a timing search to compare activation delays.';
}
function showResult(){
  if(!selected)return;
  const m=selected.metrics,container=/** @type {HTMLElement} */(document.querySelector('#metrics'));container.replaceChildren();
  const values=[['Outcome',selected.outcome],['Observed time',`${m.survivalSeconds.toFixed(2)} s${m.censored?' (limit)':''}`],['Flipper contacts',String(m.flipperContacts)],['Feature coverage',m.targetCoverage===null?'N/A':`${Math.round(m.targetCoverage*100)}%`],['Low-speed stall time',`${m.stuckSeconds.toFixed(2)} s`],['Target reached',m.targetReached===null?'No target':m.targetReached?'Yes':'No'],['Return crossings',String(m.returnCrossings.length)],['Drain x',m.drain?m.drain.x.toFixed(2):'—']];
  for(const [label,value] of values){const box=document.createElement('div');box.className='metric';const name=document.createElement('span');name.textContent=label;const strong=document.createElement('strong');strong.textContent=value;box.append(name,strong);container.append(box);}
  const hits=/** @type {HTMLElement} */(document.querySelector('#hits'));hits.replaceChildren();
  for(const [id,count] of Object.entries(m.hitDistribution)){const line=document.createElement('div');line.textContent=`${id}: ${count}`;hits.append(line);}
  /** @type {HTMLElement} */(document.querySelector('#events')).textContent=selected.events.map(e=>`${(e.tick/120).toFixed(3)}s  ${e.type}  ${e.id}`).join('\n')||'No events';
  scrub.max=String(selected.trajectory.length-1);scrub.value=scrub.max;draw();
}
function draw(){
  if(!selected)return;
  const frame=selected.trajectory[Number(scrub.value)],table=selected.config.table;
  render(ctx,{...selected.final,table,drained:false,ball:{x:frame.x,y:frame.y,angle:frame.angle},flippers:selected.final.flippers.map((f,i)=>({...f,angle:frame.flippers[i].angle})),activations:{}});
  ctx.save();ctx.scale(canvas.width/table.width,canvas.height/table.height);
  if(heat.checked){
    const h=selected.heatmap,max=Math.max(1,...h.counts);
    for(let i=0;i<h.counts.length;i++)if(h.counts[i]){ctx.fillStyle=`rgba(235,120,70,${.12+.48*Math.log1p(h.counts[i])/Math.log1p(max)})`;ctx.fillRect(i%h.columns*table.width/h.columns,Math.floor(i/h.columns)*table.height/h.rows,table.width/h.columns,table.height/h.rows);}
  }
  /** @param {ShotResult} result @param {string} color @param {number} width */
  const path=(result,color,width)=>{ctx.beginPath();result.trajectory.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke();};
  if(paths.checked)for(const trial of trials)path(trial.result,trial.result.metrics.targetReached?'#69d1a255':'#e38e9233',.018);
  path(selected,'#ffd08d',.035);
  const target=selected.config.target;
  ctx.strokeStyle='#85ecc9';ctx.lineWidth=.05;
  if(target&&'x' in target)ctx.strokeRect(target.x,target.y,target.width,target.height);
  else if(target&&'mechanismId' in target){const mechanism=table.mechanisms.find(m=>m.id===target.mechanismId);if(mechanism){ctx.beginPath();ctx.arc(mechanism.x,mechanism.y,Math.max(.25,mechanism.radius)+.13,0,Math.PI*2);ctx.stroke();}}
  ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(frame.x,frame.y,table.ballRadius*.75,0,Math.PI*2);ctx.fill();ctx.restore();
  /** @type {HTMLOutputElement} */(document.querySelector('#time')).textContent=`${(frame.tick/120).toFixed(2)} s`;
}
document.querySelector('#run')?.addEventListener('click',()=>run('shot'));
document.querySelector('#search')?.addEventListener('click',()=>run('search'));
document.querySelector('#cancel')?.addEventListener('click',()=>{worker?.terminate();worker=null;busy(false);status.textContent='Cancelled. Previous results remain available.';});
document.querySelector('#download')?.addEventListener('click',()=>{const blob=new Blob([JSON.stringify(report,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download='shot-lab-report.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
preset.addEventListener('change',loadPreset);scrub.addEventListener('input',draw);heat.addEventListener('change',draw);paths.addEventListener('change',draw);
loadPreset();run('shot');
