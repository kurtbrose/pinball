/** Physical mechanisms emit events; this table's scoring is defined here. */
export class Rules {
  /** @param {Record<string,number>} points */
  constructor(points){this.points=points;this.score=0;}
  /** @param {{type:string}[]} events */
  consume(events){for(const event of events)this.score+=this.points[event.type]??0;}
}
