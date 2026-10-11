import { runShot,searchTimings } from './shot-lab.js';

self.onmessage=event=>{
  try{
    const {spec,mode,side}=event.data;
    if(mode==='shot')self.postMessage({type:'complete',report:{kind:'shot',result:runShot(spec)}});
    else{
      const trials=[];
      for(let delay=0;delay<=48;delay+=2){
        trials.push(...searchTimings({...spec,commands:[]},{side,delays:[delay],holdTicks:24}));
        self.postMessage({type:'progress',completed:trials.length,total:25});
      }
      self.postMessage({type:'complete',report:{kind:'timing-search',trials}});
    }
  }catch(error){self.postMessage({type:'error',message:error instanceof Error?error.message:String(error)});}
};
self.postMessage({type:'ready'});
