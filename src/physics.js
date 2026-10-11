// Workers do not inherit a document's import map. Use one explicit module URL
// for the browser, worker and Node, with the package's declarations for checking.
const modulePath='../node_modules/planck/dist/planck.mjs';
const physics=/** @type {typeof import('planck')} */(await import(modulePath));
export const {World,Vec2,Edge,Circle,Box,Polygon,RevoluteJoint}=physics;
