import * as providers from './providers'
import type {
  FileStorage,
  FileStorageConfig,
} from './interfaces'

export default function initAdapter(config: FileStorageConfig): FileStorage {
  // @ts-expect-error dynamic
  return new providers[config.provider](config)
}
