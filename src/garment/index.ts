import path from 'path'

import type { FileStorage, FileStorageConfig } from '../storage/interfaces'
import initStorageAdapter from '../storage'

interface GarmentConfig {
  publishPath?: string
  snapshotPath?: string
  cachePath?: string
}

const CATALOG_FILENAME = 'index.json'
const REPOSITORY_ROOT_FILENAME = 'index.json'
const CONTAINER_EXTENSION = '.container.json'

class Garment {
  #config: GarmentConfig
  #storage: FileStorage

  constructor(
    storageConfig: FileStorageConfig,
    garmentConfig: GarmentConfig = {
      publishPath: 'repository',
      snapshotPath: 'snapshots',
      cachePath: 'cache',
    }) {
    this.#config = garmentConfig
    this.#storage = initStorageAdapter(storageConfig)
  }

  list() {
    return this.#storage.getJSON(this.getCatalogPath())
  }

  get(id: string, location = this.#config.publishPath) {
    const repositoryPath = this.getRepositoryPath(id, location)
    const key = this.path(repositoryPath, REPOSITORY_ROOT_FILENAME)
    return this.#storage.getJSON(key)
  }

  getContainer(id: string, repositoryId: string, location = this.#config.publishPath) {
    return this.#storage.getJSON(this.getContainerPath(id, repositoryId, location))
  }

  clone(id: string, dstLocation: string, srcLocation: string) {
    return this.#storage.copyDirectory(this.getRepositoryPath(id, srcLocation), dstLocation)
  }

  private path(...segments: string[]): string {
    return path.join(...segments)
  }

  private getCatalogPath() {
    return this.path(this.#config.publishPath, CATALOG_FILENAME)
  }

  private getRepositoryPath(id: string, location = this.#config.publishPath) {
    return this.path(location, id)
  }

  private getContainerPath(
    containerId: string,
    repositoryId: string,
    location = this.#config.publishPath) {
    return this.path(location, repositoryId, `${containerId}${CONTAINER_EXTENSION}`)
  }
}

export default Garment
