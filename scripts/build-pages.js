import { createHash } from 'node:crypto';
import { readdir, readFile, mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repository=fileURLToPath(new URL('../',import.meta.url));
const pages=['index.html','calibration.html','shot-lab.html'];
const styles=['style.css','shot-lab.css'];

/** Copy the unchanged module graph under one content-versioned path.
 * Existing versions in dist are retained for cached HTML and open tabs.
 * @param {string} [root] */
export async function buildPages(root=repository){
  /** @param {string} folder */
  async function filesIn(folder){
    const files=[];
    for(const entry of await readdir(resolve(root,folder),{withFileTypes:true})){
      const path=`${folder}/${entry.name}`;
      if(entry.isDirectory())files.push(...await filesIn(path));
      else if(entry.isFile())files.push(path);
      else throw new Error(`Unsupported deployment file: ${path}`);
    }
    return files;
  }
  const files=[...pages,...styles,...await filesIn('src'),...await filesIn('vendor')].sort();
  const contents=await Promise.all(files.map(file=>readFile(resolve(root,file))));
  const hash=createHash('sha256');
  for(let i=0;i<files.length;i++)hash.update(files[i]).update('\0').update(String(contents[i].length)).update('\0').update(contents[i]);
  const version=hash.digest('hex').slice(0,16),prefix=`assets/${version}/`,output=resolve(root,'dist');
  for(let i=0;i<files.length;i++){
    const file=files[i];
    if(pages.includes(file)){
      const html=contents[i].toString('utf8')
        .replace(/(href|src)="(src\/[^"\s]+|style\.css|shot-lab\.css)"/g,`$1="${prefix}$2"`)
        .replaceAll('./vendor/planck.mjs',`./${prefix}vendor/planck.mjs`);
      await mkdir(output,{recursive:true});
      await writeFile(resolve(output,file),html);
    }else{
      // Root copies support HTML cached before versioning was introduced.
      for(const destination of [resolve(output,prefix,file),resolve(output,file)]){
        await mkdir(dirname(destination),{recursive:true});
        await writeFile(destination,contents[i]);
      }
    }
  }
  await writeFile(resolve(output,'.nojekyll'),'');
  return {version,output};
}

if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const {version,output}=await buildPages();
  console.log(`Pages assets ${version}: ${output}`);
}
