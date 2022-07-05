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

  source = () => (this.env = GarmentEnv.Source) && this
  snapshot = () => (this.env = GarmentEnv.Snapshot) && this
  cache = () => (this.env = GarmentEnv.Cache) && this

  list(): Promise<CatalogEntry[]> {
    return this.api.list()
      .then(items => plainToInstance(CatalogEntry, items))
  }

  get(id: string): Promise<Repository> {
    return this.api.get(id)
      .then(item => literalProcessor(item, { env: this.env, config: this.config }))
      .then(repository => plainToInstance(Repository, repository))
  }

  getContainer(id: string, repositoryId: string) {
    return this.api.getContainer(id, repositoryId)
  }
}

export default Garment
