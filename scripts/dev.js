import concurrently from 'concurrently';
import { execaCommand } from 'execa';
import dotenv from 'dotenv';
import fkill from 'fkill';
import fs from 'node:fs/promises';
import path from 'node:path';
import { portToPid } from 'pid-port';

const configLocation = path.join(process.cwd(), '.env');
const config = await fs.readFile(configLocation, 'utf-8');
const env = dotenv.parse(config);

const { EXAMPLE_API_PORT } = env;
const log = (msg) => console.log(`\n${msg}\n`);

// Kill running services occupying req ports
for (const port of [EXAMPLE_API_PORT]) {
  try {
    const pid = await portToPid(port);
    if (pid) await fkill(pid, { force: true });
  } catch {}
}

log('🐳 Seed the localstack S3...');
await execaCommand('pnpm seed');

log('🔧 Build Garment...');
await execaCommand('pnpm build');

const libCommand =  {
  name: 'lib',
  prefixColor: 'blue',
  command: 'cd ./lib && pnpm dev',
};
const testApiCommand = {
  name: 'test-api',
  prefixColor: 'green',
  command: 'cd ./examples/api && pnpm dev',
};

log('🚀 Boot watcher and test API');
const appCommands = [libCommand, testApiCommand];

const { result } = concurrently(appCommands, {
  killOthers: true,
  killSignal: 'SIGKILL',
});

result.then(() => process.exit(0)).catch(() => process.exit(1));
