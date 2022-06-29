import path from 'path'
import initStorageAdapter from '../storage'

import type { FileStorage, FileStorageConfig } from '../storage/interfaces'
import type { GarmentConfig } from '../garment/interfaces'
import type { GarmentEnv } from '../garment/enums'

const CATALOG_FILENAME = 'index.json'
const REPOSITORY_ROOT_FILENAME = 'index.json'
const CONTAINER_EXTENSION = '.container.json'

class StorageAPI {
  #storage: FileStorage
  #config: GarmentConfig

  constructor(
    storageConfig: FileStorageConfig,
    garmentConfig: GarmentConfig) {
    this.#storage = initStorageAdapter(storageConfig)
    this.#config = garmentConfig
  }

  list(): Promise<[any]> {
    return this.#storage.getJSON(this.getCatalogPath())
  }

  get(id: string, location = this.#config.sourcePath): Promise<any> {
    const repositoryPath = this.getRepositoryPath(id, location)
    const key = this.path(repositoryPath, REPOSITORY_ROOT_FILENAME)
    return this.#storage.getJSON(key)
  }

  clone(src: string, dst: string) {
    return this.#storage.copyDirectory(src, dst)
  }

  cloneToEnv(src: string, env: GarmentEnv, directory: '') {
    const dst = this.path(this.#config[env], directory)
    return this.#storage.copyDirectory(src, dst)
  }

  getContainer(id: string, repositoryId: string, location = this.#config.sourcePath) {
    return this.#storage
      .getJSON(this.getContainerPath(id, repositoryId, location))
  }

  private getCatalogPath() {
    return this.path(this.#config.sourcePath, CATALOG_FILENAME)
  }

  private getRepositoryPath(id: string, location = this.#config.sourcePath) {
    return this.path(location, id, '/')
  }

  private getContainerPath(
    containerId: string,
    repositoryId: string,
    location = this.#config.sourcePath) {
    return this.path(location, repositoryId, `${containerId}${CONTAINER_EXTENSION}`)
  }

  private path(...segments: string[]): string {
    return path.join(...segments)
  }
}

export default StorageAPI
