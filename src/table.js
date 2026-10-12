// Metres, with +x right and +y down. Gravity models the playfield incline.
export const table = {
  width: 6, height: 10, gravity: 5.5, ballRadius: 0.13,
  walls: [
    [[0.35, 9.8], [0.35, 1.2]], [[0.35, 1.2], [1.2, 0.35]],
    [[1.2, 0.35], [4.8, 0.35]], [[4.8, 0.35], [5.65, 1.2]],
    [[5.65, 1.2], [5.65, 9.8]],
    [[0.35, 7], [1.65, 8.15]], [[5.65, 7], [4.35, 8.15]],
  ],
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
  mechanisms: /** @type {{id:string,type:'post'|'bumper'|'sling',x:number,y:number,radius:number,kick:number,vertices?:number[][],direction?:number[]}[]} */ ([]),
  game:{enabled:false,balls:3,drainY:10.3,resetDelay:90},
  plunger:{maxPullTicks:90,minSpeed:8,maxSpeed:16},
  nudge:{velocity:0,cooldownTicks:30},
  points:{'post.hit':10,'bumper.hit':100,'sling.hit':50},
};

// Deliberate arcade scale: 6 × 10 world units, not real-machine SI calibration.
// Keep the prototype dynamics while adding a full layout and clearer proportions.
export const firstTable = {
  ...table, ballRadius:0.18, flipperLength:1.05,
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
    // Continuous downhill protection joins the outer heels. Held catches must
    // release when the paddle lowers; outlanes remain outside these guides.
    [[.9,6.3],[.9,7.3]],[[.9,7.3],[1.65,8.2]],
    [[4.5,6.3],[4.5,7.3]],[[4.5,7.3],[4.35,8.2]],
  ],
  mechanisms:[
    {id:'pop-left',type:/** @type {const} */('bumper'),x:2,y:2.7,radius:.38,kick:6},
    {id:'pop-right',type:/** @type {const} */('bumper'),x:3.75,y:2.7,radius:.38,kick:6},
    {id:'pop-center',type:/** @type {const} */('bumper'),x:2.85,y:4,radius:.38,kick:6},
    {id:'post-left',type:/** @type {const} */('post'),x:1.25,y:4.7,radius:.16,kick:0},
    {id:'post-right',type:/** @type {const} */('post'),x:4.4,y:4.7,radius:.16,kick:0},
    {id:'lane-left',type:/** @type {const} */('post'),x:.9,y:6.3,radius:.13,kick:0},
    {id:'lane-right',type:/** @type {const} */('post'),x:4.5,y:6.3,radius:.13,kick:0},
    // Short slings leave full-ball room above the raised flippers and guide exits.
    {id:'sling-left',type:/** @type {const} */('sling'),x:1.85,y:6.7,radius:0,kick:5,vertices:[[1.65,6.4],[1.65,6.85],[2.25,7.0]],direction:[1,-1]},
    {id:'sling-right',type:/** @type {const} */('sling'),x:3.65,y:6.7,radius:0,kick:5,vertices:[[3.75,6.4],[3.45,7.0],[3.75,6.85]],direction:[-1,-1]},
  ],
};
