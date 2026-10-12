import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { firstTable } from '../src/table.js';
import { generateArrivals,clearArrival,evaluateLayout } from '../src/layout-evaluation.js';
import { runShot } from '../src/shot-lab.js';
const profile=JSON.parse(readFileSync(new URL('../scenarios/default-layout-evaluation.json',import.meta.url),'utf8'));

test('generated spatial probes are repeatable and exclude overlaps and outside playfield starts',()=>{
  const original=structuredClone(firstTable),a=generateArrivals(firstTable,profile);
  assert.deepEqual(a,generateArrivals(firstTable,profile));
  assert.ok(a.arrivals.length>100);
  assert.ok(a.arrivals.every(p=>clearArrival(p,firstTable)));
  assert.ok(!a.arrivals.some(p=>p.x===.54&&p.y===.6));
  assert.ok(a.arrivals.some(p=>p.source.startsWith('corner:')));
  assert.deepEqual(firstTable,original);
});

test('routine evaluation detects missing wall collectors without selecting individual failing shots',()=>{
  const missing={...firstTable,guides:[]};
  const report=evaluateLayout(missing,profile);
  assert.ok(report.failures>0);
  assert.ok(report.findings.some(f=>f.severity==='failure'&&f.id.startsWith('left-wall-offset0-vx0')));
  assert.ok(report.findings.some(f=>f.severity==='failure'&&f.id.startsWith('right-wall-offset0-vx0')));
});

test('generated space probes detect an inaccessible passive pocket and retain exact replay',()=>{
  const box={...firstTable,flippers:[],mechanisms:[],gates:[],guides:[],walls:[[[2.5,4.5],[2.5,6]],[[2.5,6],[3.5,6]],[[3.5,6],[3.5,4.5]]]};
  const local={bounds:{x:2.8,y:5,width:.4,height:.5},gridSpacing:.2,playfield:[[2.5,4.5],[3.5,4.5],[3.5,6],[2.5,6]],feeds:[]};
  const report=evaluateLayout(box,local);
  const failure=report.findings.find(f=>f.severity==='failure'&&f.reason.includes('Persistent low-speed'));
  assert.ok(failure);
  assert.deepEqual(runShot(failure.config),failure.result);
  assert.equal(report.coverage.positions>0,true);
});
