import test from 'node:test';
import assert from 'node:assert/strict';
import { runRoute } from '../src/route-lab.js';
import { shotPresets } from '../src/shot-presets.js';
import { firstTable } from '../src/table.js';
import { readFileSync } from 'node:fs';
const empty={...firstTable,walls:[],guides:[],flippers:[],gates:[],mechanisms:[],gravity:0,damping:{linear:0,angular:0},game:{...firstTable.game,enabled:false}};
test('ordered route stages ignore early crossings and use every physics tick',()=>{
  const spec={table:empty,initial:{x:2,y:2,vx:2,vy:0},ticks:120,sampleEvery:100};
  const stages=[{id:'entry',region:{x:2.5,y:1,width:.01,height:2}},{id:'exit',region:{x:3,y:1,width:.01,height:2}}];
  const result=runRoute(spec,stages);assert.equal(result.complete,true);
  assert.ok(result.stages[1].tick>result.stages[0].tick);
  assert.deepEqual(runRoute({...spec,sampleEvery:1},stages).stages,result.stages);
  assert.equal(runRoute(spec,[stages[1],stages[0]]).complete,false);
  assert.ok(result.result.trajectory.length<10);
  assert.deepEqual(runRoute(spec,stages),result);
});
test('event followed by a return region requires actual downstream passage',()=>{
  const spec={...shotPresets.left,ticks:1200};
  const route=runRoute(spec,[{id:'contact',event:{type:'flipper.contact',id:'flipper-0'}},{id:'redirect',region:{x:1,y:6.1,width:3.8,height:.15}}]);
  assert.equal(route.complete,true);
  assert.ok(route.stages[1].tick>route.stages[0].tick);
  assert.throws(()=>runRoute(spec,[{id:'bad'}]),/either/);
});

test('wall descents enter the protected feed and reach a paddle instead of bypassing it',()=>{
  const before=JSON.parse(readFileSync(new URL('../scenarios/layout-before-route-review.json',import.meta.url),'utf8'));
  for(const side of ['left','right'])for(const vy of [.1,2,5]){
    const spec={initial:{x:side==='left'?.56:4.89,y:4.5,vx:0,vy},ticks:1800};
    const stages=[{id:'inlane',region:{x:side==='left'?1.08:4.05,y:6.5,width:.42,height:.2}},{id:'paddle',event:{type:'flipper.contact'}}];
    const previous=runRoute({...spec,table:before},stages),revised=runRoute({...spec,table:firstTable},stages);
    assert.equal(previous.complete,false,`${side} vy=${vy} baseline bypass`);
    assert.equal(revised.complete,true,`${side} vy=${vy} protected route`);
    assert.ok(revised.result.metrics.longestSlowSeconds<1);
  }
});

test('collector/post junction misses remain movable and intentional loss routes remain open',()=>{
  for(const initial of [{x:4.45,y:3.5,vx:.4,vy:-2},{x:1.15,y:5.9,vx:-2,vy:.1},{x:4.3,y:5.9,vx:2,vy:.1},{x:3,y:8.7,vx:0,vy:.1}]){
    const result=runRoute({table:firstTable,initial,ticks:3600},[{id:'drain',event:{type:'ball.drain'}}]);
    assert.equal(result.complete,true);
    assert.ok(result.result.metrics.longestSlowSeconds<1);
  }
});

test('lateral misses can enter both outlanes from the playfield',()=>{
  for(const side of ['left','right']){
    const route=runRoute({table:firstTable,initial:{x:side==='left'?1.15:4.3,y:5.9,vx:side==='left'?-2:2,vy:.1},ticks:1800},[
      {id:'outlane',region:{x:side==='left'?.35:4.7,y:6.5,width:side==='left'?.55:.4,height:.2}},
      {id:'loss',event:{type:'ball.drain'}}
    ]);
    assert.equal(route.complete,true);
    assert.equal(route.result.metrics.flipperContacts,0);
  }
});

test('upstream miss detects the rejected collector/post pocket and verifies its repair',()=>{
  const before=JSON.parse(readFileSync(new URL('../scenarios/layout-before-route-review.json',import.meta.url),'utf8'));
  const rejected={...before,walls:[...before.walls,[[.35,5],[.9,5.6]],[[5.1,5],[4.5,5.6]]]};
  const spec={initial:{x:4.45,y:3.5,vx:.4,vy:-2},ticks:2400};
  const trapped=runRoute({...spec,table:rejected},[{id:'drain',event:{type:'ball.drain'}}]);
  assert.equal(trapped.complete,false);
  assert.ok(trapped.result.metrics.longestSlowSeconds>10);
  const repaired=runRoute({...spec,table:firstTable},[{id:'drain',event:{type:'ball.drain'}}]);
  assert.equal(repaired.complete,true);
  assert.ok(repaired.result.metrics.longestSlowSeconds<1);
});
