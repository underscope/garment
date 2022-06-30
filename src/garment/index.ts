import { plainToInstance } from 'class-transformer'

import API from '../api'
import type { FileStorageConfig } from '../storage/interfaces'
import type { GarmentConfig } from './interfaces'
import { GarmentEnv } from './enums'
import { Activity, CatalogItem, Repository } from './entities'

class Garment {
  private config: GarmentConfig
  private _env: GarmentEnv
  api: API

  constructor(
    storageConfig: FileStorageConfig,
    garmentConfig: GarmentConfig = {
      [GarmentEnv.Source]: 'repository',
      [GarmentEnv.Snapshot]: 'snapshots',
      [GarmentEnv.Cache]: 'cache',
    }) {
    this.config = garmentConfig
    this.api = new API(storageConfig, garmentConfig)
    this._env = GarmentEnv.Source
    CatalogItem.api = Repository.api = Activity.api = this.api
  }

  get env() { return this._env }
  private set env(val: GarmentEnv) { this._env = val }

  source = () => (this.env = GarmentEnv.Source) && this
  snapshot = () => (this.env = GarmentEnv.Snapshot) && this
  cache = () => (this.env = GarmentEnv.Cache) && this

  list(): Promise<CatalogItem[]> {
    return this.api.list()
      .then(items => plainToInstance(CatalogItem, items))
  }

  get(id: string): Promise<Repository> {
    return this.api.get(id)
      .then(item => this.processRepository(item))
      .then(repository => plainToInstance(Repository, repository))
  }

  getContainer(id: string, repositoryId: string) {
    return this.api.getContainer(id, repositoryId)
  }

  private processRepository(repository: Repository) {
    this.attachGarmentEnv(repository)
    this.attachRepositoryIdToActivity(repository)
    return repository
  }

  private attachGarmentEnv(item: Repository) {
    item.envPath = this.config[this.env]
    return item
  }

  private attachRepositoryIdToActivity(item: Repository) {
    item.structure.forEach((activity) => { activity.repositoryId = item.id })
    return item
  }
}

export default Garment
