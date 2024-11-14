import fs from 'node:fs/promises'
import path from 'node:path'
import concurrently from 'concurrently'
import dotenv from 'dotenv'
import { execaCommand } from 'execa'
import fkill from 'fkill'
import { portToPid } from 'pid-port'

const log = msg => console.log(`\n${msg}\n`)
const timeout = ms => new Promise(resolve => setTimeout(resolve, ms))

const configLocation = path.join(process.cwd(), '.env')
const config = await fs.readFile(configLocation, 'utf-8')
const env = dotenv.parse(config)

// Kill running services occupying req ports
for (const port of [env.EXAMPLE_API_PORT]) {
  try {
    const pid = await portToPid(port)
    if (pid)
      await fkill(pid, { force: true })
  }
  catch {}
}

// Wait for the localstack to boot
await timeout(3000)

log('🔧 Build Garment...')
await execaCommand('pnpm build')

if (env.RESET_EXAMPLE_BUCKET) {
  log('🐳 Reset the S3 bucket...')
  await execaCommand('pnpm seed')
}

const libCommand = {
  name: 'lib',
  prefixColor: 'blue',
  command: 'cd ./lib && pnpm dev',
}
const testApiCommand = {
  name: 'test-api',
  prefixColor: 'green',
  command: 'cd ./examples/api && pnpm dev',
}

log('🚀 Boot watcher and test API')
const appCommands = [libCommand, testApiCommand]

dotenv.config({ path: configLocation })
const { result } = concurrently(appCommands, {
  killOthers: true,
  killSignal: 'SIGKILL',
})

result.then(() => process.exit(0)).catch(() => process.exit(1))
