import { plainToInstance } from 'class-transformer'

import API from '../api'
import type { FileStorageConfig } from '../storage/interfaces'
import type { GarmentConfig } from './interfaces'
import { GarmentEnv } from './enums'
import { literalProcessor } from './entities/repository'

import {
  Activity,
  CatalogEntry,
  ContentContainer,
  ContentElement,
  Repository,
} from './entities'

class Garment {
  private config: GarmentConfig
  api: API

  constructor(
    storageConfig: FileStorageConfig,
    garmentConfig: GarmentConfig = {
      [GarmentEnv.Source]: 'repository',
      [GarmentEnv.Snapshot]: 'snapshots',
      fileKeyProp: 'id',
    }) {
    this.config = garmentConfig
    this.api = new API(storageConfig, garmentConfig)

    CatalogEntry.api
      = Repository.api
      = Activity.api
      = ContentElement.api
      = ContentContainer.api
      = this.api

    Repository.fileKeyProp
      = ContentContainer.fileKeyProp
      = garmentConfig.fileKeyProp
  }

  source = () => ({
    list: () => this.list,
    get: (id: string, eager = false) => this.get(id, GarmentEnv.Source, eager),
    getContainer: (id: string, repositoryId: string) =>
      this.getContainer(id, repositoryId, GarmentEnv.Source),
  })

  snapshot = () => ({
    get: (id: number | string, version: string, eager = false) => {
      const snapshotKey = Repository.getSnapshotKey(id, version)
      return this.get(snapshotKey, GarmentEnv.Snapshot, eager)
    },
    getContainer: (id: string, repositoryId: string) =>
      this.getContainer(id, repositoryId, GarmentEnv.Snapshot),
  })

  private list(): Promise<CatalogEntry[]> {
    return this.api.list()
      .then(items => plainToInstance(CatalogEntry, items))
  }

  private get(id: string, env: GarmentEnv, eager: boolean): Promise<Repository> {
    const location = this.config[env]
    return this.api.get(id, location)
      .then(item => literalProcessor(item, { env, config: this.config }))
      .then(repository => plainToInstance(Repository, repository))
      .then(repository => eager ? repository.load() : repository)
  }

  private getContainer(id: string, repositoryId: string, env: GarmentEnv) {
    const location = this.config[env]
    return this.api.getContainer(id, repositoryId, location)
  }
}

export default Garment
