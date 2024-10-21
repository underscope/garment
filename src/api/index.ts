import type { GarmentEnv } from '../garment/enums'
import type { FileKeyType, GarmentConfig } from '../garment/interfaces'

import type { FileStorage, FileStorageConfig } from '../storage/interfaces'
import path from 'node:path'
import initStorageAdapter from '../storage'
import initProcessMeta from './process-meta'

const CATALOG_FILENAME = 'index.json'
const REPOSITORY_ROOT_FILENAME = 'index.json'
const CONTAINER_EXTENSION = 'container.json'

class StorageAPI {
  #storage: FileStorage
  #config: GarmentConfig
  processMeta: Function

  constructor(
    storageConfig: FileStorageConfig,
    garmentConfig: GarmentConfig,
  ) {
    this.#storage = initStorageAdapter(storageConfig)
    this.#config = garmentConfig
    this.processMeta = initProcessMeta(this)
  }

  list(): Promise<[any]> {
    return this.#storage.getJSON(this.getCatalogPath())
  }

  get(id: FileKeyType, location = this.#config.sourcePath): Promise<any> {
    const repositoryPath = this.getRepositoryPath(id, location)
    const key = this.path(repositoryPath, REPOSITORY_ROOT_FILENAME)
    return this.#storage.getJSON(key)
  }

  getSignedUrl(key: string, secondsAvailable: number) {
    return this.#storage.getSignedObjectUrl(key, secondsAvailable)
  }

  clone(src: string, dst: string) {
    return this.#storage.copyDirectory(src, dst)
  }

  cloneToEnv(src: string, env: GarmentEnv, directory: '') {
    const dst = this.path(this.#config[env], directory)
    return this.#storage.copyDirectory(src, dst)
  }

  getContainer(
    id: string,
    repositoryId: string,
    location = this.#config.sourcePath,
    ext = CONTAINER_EXTENSION,
  ) {
    return this.#storage
      .getJSON(this.getContainerPath(id, repositoryId, location, ext))
  }

  private getCatalogPath() {
    return this.path(this.#config.sourcePath, CATALOG_FILENAME)
  }

  private getRepositoryPath(id: FileKeyType, location = this.#config.sourcePath) {
    return this.path(location, `${id}`, '/')
  }

  private getContainerPath(
    containerId: string,
    repositoryId: string,
    location = this.#config.sourcePath,
    ext = CONTAINER_EXTENSION,
  ) {
    return this.path(location, repositoryId, `${containerId}.${ext}`)
  }

  private path(...segments: string[]): string {
    return path.join(...segments)
  }
}

export default StorageAPI
