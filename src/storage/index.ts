import * as providers from './providers'
import type {
  FileStorage,
  FileStorageConfig,
} from './interfaces'

export default function initAdapter(config: FileStorageConfig): FileStorage {
  return new providers[config.provider](config)
}
