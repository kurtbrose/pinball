import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
const root=resolve('.');
const types={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css'};
createServer(async(req,res)=>{
  try {
    const path=resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname === '/' ? '/index.html' : new URL(req.url,'http://localhost').pathname));
    if(!path.startsWith(root+sep)){res.writeHead(403);res.end();return;}
    const data=await readFile(path);res.writeHead(200,{'Content-Type':types[extname(path)]||'application/octet-stream'});res.end(data);
  }catch{res.writeHead(404);res.end('Not found');}
}).listen(5173,'127.0.0.1',()=>console.log('Pinball: http://localhost:5173'));
