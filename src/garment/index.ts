import { plainToInstance } from 'class-transformer'

import API from '../api'
import type { FileStorageConfig } from '../storage/interfaces'
import type { GarmentConfig } from './interfaces'

import { Activity, CatalogItem, Repository } from './entities'

class Garment {
  api: API

  constructor(
    storageConfig: FileStorageConfig,
    garmentConfig: GarmentConfig = {
      publishPath: 'repository',
      snapshotPath: 'snapshots',
      cachePath: 'cache',
    }) {
    this.api = new API(storageConfig, garmentConfig)
    CatalogItem.api = Repository.api = Activity.api = this.api
  }

  list(): Promise<CatalogItem[]> {
    return this.api.list()
      .then(items => plainToInstance(CatalogItem, items))
  }

  get(id: string): Promise<Repository> {
    return this.api.get(id)
      .then(repository => plainToInstance(Repository, repository))
  }

  getContainer(id: string, repositoryId: string) {
    return this.api.getContainer(id, repositoryId)
  }
}

export default Garment
