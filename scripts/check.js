import { spawnSync } from 'node:child_process';
for (const args of [['node_modules/typescript/bin/tsc'], ['--test']]) {
  const result = spawnSync(process.execPath, args, { stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
