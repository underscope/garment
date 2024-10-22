import type {
  FileStorage,
  FileStorageConfig,
} from './interfaces'
import * as providers from './providers'

export default function initAdapter(config: FileStorageConfig): FileStorage {
  return new providers[config.provider](config)
}
