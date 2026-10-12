import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, cp, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildPages } from '../scripts/build-pages.js';

test('Pages versions the complete graph, keeps relative workers, and retains old assets',async()=>{
  const root=await mkdtemp(join(tmpdir(),'pinball-pages-'));
  try{
    const repository=fileURLToPath(new URL('../',import.meta.url));
    for(const path of ['index.html','calibration.html','shot-lab.html','style.css','shot-lab.css','src','vendor'])
      await cp(join(repository,path),join(root,path),{recursive:true});
    const a=await buildPages(root),again=await buildPages(root);
    assert.equal(a.version,again.version);
    const prefix=`assets/${a.version}/`;
    for(const [page,entry,css] of [['index.html','main.js','style.css'],['calibration.html','calibration-ui.js','style.css'],['shot-lab.html','shot-lab-ui.js','shot-lab.css']]){
      const html=await readFile(join(root,'dist',page),'utf8');
      assert.ok(html.includes(`src="${prefix}src/${entry}"`));
      assert.ok(html.includes(`href="${prefix}${css}"`));
      assert.ok(html.includes(`./${prefix}vendor/planck.mjs`));
    }
    for(const path of ['src/table.js','src/physics.js','src/shot-lab-worker.js','vendor/planck.mjs','style.css'])
      assert.deepEqual(await readFile(join(root,'dist',prefix,path)),await readFile(join(root,path)));
    const ui=await readFile(join(root,'dist',prefix,'src/shot-lab-ui.js'),'utf8');
    assert.ok(ui.includes("new URL('./shot-lab-worker.js',import.meta.url)"));
    assert.ok((await readFile(join(root,'dist',prefix,'src/physics.js'),'utf8')).includes("'../vendor/planck.mjs'"));
    const old=await readFile(join(root,'src/table.js'),'utf8');
    await writeFile(join(root,'src/table.js'),old+'\n// new table revision\n');
    const b=await buildPages(root);
    assert.notEqual(a.version,b.version);
    assert.equal(await readFile(join(root,'dist',prefix,'src/table.js'),'utf8'),old);
    assert.ok((await readFile(join(root,'dist','index.html'),'utf8')).includes(`assets/${b.version}/src/main.js`));
    assert.deepEqual(await readFile(join(root,'dist','src/table.js')),await readFile(join(root,'src/table.js')));
    const css=await readFile(join(root,'style.css'),'utf8');
    await writeFile(join(root,'style.css'),css+'\n/* new stylesheet */\n');
    assert.notEqual((await buildPages(root)).version,b.version);
  }finally{await rm(root,{recursive:true,force:true});}
});
