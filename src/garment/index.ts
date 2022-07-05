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
  private _env: GarmentEnv
  private config: GarmentConfig
  api: API

  constructor(
    storageConfig: FileStorageConfig,
    garmentConfig: GarmentConfig = {
      [GarmentEnv.Source]: 'repository',
      [GarmentEnv.Snapshot]: 'snapshots',
    }) {
    this.config = garmentConfig
    this.api = new API(storageConfig, garmentConfig)
    this._env = GarmentEnv.Source

    CatalogEntry.api
      = Repository.api
      = Activity.api
      = ContentElement.api
      = ContentContainer.api
      = this.api
  }

  get env() { return this._env }
  private set env(val: GarmentEnv) { this._env = val }

  source = () => ({
    list: () => this.list,
    get: (id: string) => this.get(id, GarmentEnv.Source),
    getContainer: (id: string) => this.getContainer(id, GarmentEnv.Source),
  })

  snapshot = () => ({
    get: (id: string) => this.get(id, GarmentEnv.Snapshot),
    getContainer: (id: string) => this.getContainer(id, GarmentEnv.Snapshot),
  })

  private list(): Promise<CatalogEntry[]> {
    return this.api.list()
      .then(items => plainToInstance(CatalogEntry, items))
  }

  private get(id: string, env: GarmentEnv): Promise<Repository> {
    const directory = this.config[env]
    return this.api.get(id, directory)
      .then(item => literalProcessor(item, { env, config: this.config }))
      .then(repository => plainToInstance(Repository, repository))
  }

  private getContainer(id: string, repositoryId: string) {
    const location = this.config[this.env]
    return this.api.getContainer(id, repositoryId, location)
  }
}

export default Garment
