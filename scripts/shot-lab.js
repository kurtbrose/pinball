import { readFile,writeFile,mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import { performance } from 'node:perf_hooks';
import { runShot,searchTimings } from '../src/shot-lab.js';
import { shotPresets } from '../src/shot-presets.js';

const args=process.argv.slice(2);
if(args.includes('--help')){
  console.log('node scripts/shot-lab.js [--preset left|right|shooter] [--input scenario.json] [--search left|right] [--out results/shot.json]\nInput accepts a ShotSpec or a saved report with .config. Search tries delays 0–48 in steps of 2, holding 24 ticks.');
  process.exit(0);
}
try{
  const options={};
  for(let i=0;i<args.length;i+=2){if(!['--preset','--input','--search','--out'].includes(args[i])||!args[i+1]||args[i+1].startsWith('--'))throw new Error('Invalid arguments; use --help');options[args[i]]=args[i+1];}
  let spec=structuredClone(shotPresets[options['--preset']??'left']);
  if(options['--input']){const input=JSON.parse(await readFile(options['--input'],'utf8'));spec={table:shotPresets.left.table,...(input.config??input.result?.config??input)};if(input.kind==='timing-search')throw new Error('Choose a trial.result.config from the timing-search report to replay a single shot');}
  if(!spec)throw new Error('Unknown preset');
  const start=performance.now();
  const report=options['--search']?
    {version:1,kind:'timing-search',trials:searchTimings({...spec,commands:[]},{side:options['--search'],delays:Array.from({length:25},(_,i)=>i*2),holdTicks:24})}:
    runShot(spec);
  const elapsedMs=performance.now()-start;
  const results='trials' in report?report.trials.map(t=>t.result):[report];
  const ticks=results.reduce((n,r)=>n+r.metrics.elapsedTicks+(r.config.warmup?.ticks??0),0);
  const summary={shots:results.length,successful:results.filter(r=>r.metrics.targetReached).length,drained:results.filter(r=>r.outcome==='drained').length,escaped:results.filter(r=>r.outcome==='escaped').length,censored:results.filter(r=>r.metrics.censored).length,physicsTicks:ticks,wallMilliseconds:Math.round(elapsedMs),ticksPerSecond:Math.round(ticks/(elapsedMs/1000))};
  if(options['--out']){await mkdir(dirname(options['--out']),{recursive:true});await writeFile(options['--out'],JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(summary,null,2));console.log(`Saved ${options['--out']}`);}
  else{console.error(JSON.stringify(summary));console.log(JSON.stringify(report,null,2));}
}catch(error){console.error(error instanceof Error?error.message:error);process.exitCode=1;}
