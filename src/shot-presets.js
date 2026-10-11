import { firstTable } from './table.js';
/** @type {Record<string,import('./shot-lab.js').ShotSpec>} */
export const shotPresets={
  left:{name:'Left flipper approach',table:firstTable,initial:{x:2.5,y:8.1,vx:-.4,vy:2},ticks:360,commands:[{tick:8,input:{left:true}},{tick:32,input:{}}],target:{mechanismId:'pop-center'}},
  right:{name:'Right flipper approach',table:firstTable,initial:{x:3.5,y:8.1,vx:.4,vy:2},ticks:360,commands:[{tick:8,input:{right:true}},{tick:32,input:{}}],target:{mechanismId:'pop-center'}},
  shooter:{name:'Full-strength shooter exit',table:firstTable,initial:{x:firstTable.spawn.x,y:9.11,vx:0,vy:-16},ticks:1200,commands:[],target:{id:'main-playfield',x:.5,y:2,width:4.4,height:4}},
};
