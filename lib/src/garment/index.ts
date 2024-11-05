import type { FileStorageConfig } from '../storage/interfaces'

import type { FileKeyType, GarmentConfig } from './interfaces'
import { plainToInstance } from 'class-transformer'
import API from '../api'
import {
  Activity,
  CatalogEntry,
  ContentContainer,
  ContentElement,
  Repository,
} from './entities'
import { instanceProcessor, literalProcessor } from './entities/repository'

import { GarmentEnv } from './enums'

interface GetOptions { eager?: boolean }

class Garment {
  private config: GarmentConfig
  api: API

  constructor(
    storageConfig: FileStorageConfig,
    garmentConfig: GarmentConfig = {
      [GarmentEnv.Source]: 'repository',
      [GarmentEnv.Snapshot]: 'snapshots',
      [GarmentEnv.Preview]: 'preview',
      fileKeyProp: 'id',
    },
  ) {
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
    list: () => this.list(),
    get: (id: FileKeyType, options: GetOptions = {}) => {
      return this.get(id, GarmentEnv.Source, options.eager)
    },
    getContainer: (id: string, repositoryId: string) =>
      this.getContainer(id, repositoryId, GarmentEnv.Source),
  })

  preview = () => ({
    list: () => this.list(GarmentEnv.Preview),
    get: (id: FileKeyType, options: GetOptions = {}) => {
      return this.get(id, GarmentEnv.Preview, options.eager)
    },
    getContainer: (id: string, repositoryId: string) =>
      this.getContainer(id, repositoryId, GarmentEnv.Preview),
  })

  snapshot = () => ({
    get: (id: FileKeyType, version: string, options: GetOptions = {}) => {
      const snapshotKey = Repository.getSnapshotKey(id, version)
      return this.get(snapshotKey, GarmentEnv.Snapshot, options.eager)
    },
    getContainer: (id: string, repositoryId: string) =>
      this.getContainer(id, repositoryId, GarmentEnv.Snapshot),
  })

  addContentElementProcessor = (processorRegistry: (type: string) => Function) => {
    ContentElement.customProcessorRegistry = processorRegistry
  }

  toRepositoryInstance = (repository: any) => {
    const instance = plainToInstance(Repository, repository)
    return instanceProcessor(instance)
  }

  private list(env = GarmentEnv.Source): Promise<CatalogEntry[]> {
    const catalogPath = this.config[env]
    return this.api.list(catalogPath)
      .then(items => plainToInstance(CatalogEntry, items))
  }

  private get(id: FileKeyType, env: GarmentEnv, eager = false): Promise<Repository> {
    const location = this.config[env]
    return this.api.get(id, location)
      .then(item => literalProcessor(item, { env, config: this.config }))
      .then(repository => plainToInstance(Repository, repository))
      .then(repository => instanceProcessor(repository))
      .then(repository => eager ? repository.load() : repository)
  }

  private getContainer(id: string, repositoryId: string, env: GarmentEnv) {
    const location = this.config[env]
    return this.api.getContainer(id, repositoryId, location)
  }
}

export default Garment
