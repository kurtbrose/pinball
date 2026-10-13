// Metres, with +x right and +y down. Gravity models the playfield incline.
export const table = {
  width: 6, height: 10, gravity: 5.5, ballRadius: 0.13,
  walls: [
    [[0.35, 9.8], [0.35, 1.2]], [[0.35, 1.2], [1.2, 0.35]],
    [[1.2, 0.35], [4.8, 0.35]], [[4.8, 0.35], [5.65, 1.2]],
    [[5.65, 1.2], [5.65, 9.8]],
    [[0.35, 7], [1.65, 8.15]], [[5.65, 7], [4.35, 8.15]],
  ],
  apron: /** @type {{y:number}|undefined} */ (undefined),
  flipperY: 8.2, flipperLength: 1.12, flipperRadius: 0.12,
  // Strong actuator: quick acceleration and firm hold under ball contact.
  restAngle: 0.42, raisedAngle: -0.5, motorSpeed: 30, returnSpeed: 22, motorTorque: 400,
  holdTorque: 100, returnTorque: 80, endStrokeAngle: 0.04,
  flippers: [{x:1.65,y:8.2,side:1},{x:4.35,y:8.2,side:-1}],
  spawn: {x:2.4,y:1.5,vx:1.15,vy:0},
  materials: {
    wall:{friction:0.15,restitution:0.65},
    flipper:{density:8,friction:0.35,restitution:0.45},
    ball:{density:7.8,friction:0.18,restitution:0.5},
    rubber:{friction:0.2,restitution:0.85},
  },
  damping:{linear:0.025,angular:0.02},
  gates: /** @type {{id:string,a:number[],b:number[],allowedDirection:number[]}[]} */([]),
  guides: /** @type {{a:number[],b:number[],restitution:number}[]} */([]),
  mechanisms: /** @type {{id:string,type:'post'|'bumper'|'sling',x:number,y:number,radius:number,kick:number,vertices?:number[][],direction?:number[],activeNormal?:number[]}[]} */ ([]),
  game:{enabled:false,balls:3,drainY:10.3,resetDelay:90},
  plunger:{maxPullTicks:90,minSpeed:8,maxSpeed:16},
  nudge:{velocity:0,cooldownTicks:30},
  points:{'post.hit':10,'bumper.hit':100,'sling.hit':50},
};

// Deliberate arcade scale: 6 × 10 world units, not real-machine SI calibration.
// Fresh reference-led open table; retain the calibrated actuator baseline.
export const firstTable = {
  ...table, ballRadius:0.13, flipperLength:.95, apron:{y:9.05},
  // Conventional two-flipper lower field, centered in the playable area
  // (the shooter channel lies outside x=5.1).
  flippers:[{x:1.5,y:8.15,side:1},{x:3.95,y:8.15,side:-1}],
  // Arcade table-frame jolt, not a calibrated cabinet movement model.
  nudge:{velocity:1.2,cooldownTicks:30},
  plunger:{maxPullTicks:90,minSpeed:11,maxSpeed:16},
  spawn:{x:5.38,y:8.96,vx:0,vy:0},
  game:{enabled:true,balls:3,drainY:10.3,resetDelay:90},
  // Pass an upward plunge; deflect returning balls left into the playfield.
  gates:[{id:'shooter-exit',a:[5.1,1.85],b:[5.65,1.3],allowedDirection:[0,-1]}],
  // Passive collectors absorb the normal bounce and roll wall returns inward.
  guides:[{a:[.35,4.9],b:[.9,5.75],restitution:.05},{a:[5.1,4.9],b:[4.55,5.75],restitution:.05}],
  walls:[
    [[.35,9.8],[.35,1.2]],[[.35,1.2],[1.2,.35]],
    [[1.2,.35],[4.8,.35]],[[4.8,.35],[5.65,1.2]],[[5.65,1.2],[5.65,9.3]],
    [[5.1,1.85],[5.1,9.3]],[[5.1,9.3],[5.65,9.3]],
    // Near-tangent guide exits meet the upper heel without a V-shaped pocket. Held catches must
    // release when the paddle lowers; outlanes remain outside these guides.
    [[.9,6.3],[.9,7.78]],[[.9,7.78],[1.45,8.02]],
    [[4.55,6.3],[4.55,7.78]],[[4.55,7.78],[4,8.02]],
  ],
  mechanisms:[
    {id:'pop-left',type:/** @type {const} */('bumper'),x:2,y:2.7,radius:.38,kick:6},
    {id:'pop-right',type:/** @type {const} */('bumper'),x:3.45,y:2.7,radius:.38,kick:6},
    {id:'pop-center',type:/** @type {const} */('bumper'),x:2.725,y:3.9,radius:.38,kick:6},
    {id:'post-left',type:/** @type {const} */('post'),x:1.25,y:4.7,radius:.16,kick:0},
    {id:'post-right',type:/** @type {const} */('post'),x:4.4,y:4.7,radius:.16,kick:0},
    {id:'lane-left',type:/** @type {const} */('post'),x:.9,y:6.3,radius:.13,kick:0},
    {id:'lane-right',type:/** @type {const} */('post'),x:4.55,y:6.3,radius:.13,kick:0},
    // Paired triangular slings frame the lower fan. Their outer edges form
    // protected inlanes; their inner tips clear the full raised-paddle sweep.
    {id:'sling-left',type:/** @type {const} */('sling'),x:1.85,y:6.85,radius:0,kick:5,vertices:[[1.4,6.05],[1.4,7.05],[2.05,7.35]],direction:[1,-1],activeNormal:[1.3,-.65]},
    {id:'sling-right',type:/** @type {const} */('sling'),x:3.6,y:6.85,radius:0,kick:5,vertices:[[4.05,6.05],[3.4,7.35],[4.05,7.05]],direction:[-1,-1],activeNormal:[-1.3,-.65]},
  ],
};
