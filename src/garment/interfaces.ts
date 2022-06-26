export interface GarmentConfig {
  publishPath: string
  snapshotPath: string
  cachePath: string
}

export interface CatalogItem {
  id: number
  uid: string
  schema: string
  name: string
  description: string
  meta: Object
  publishedAt: string
  detachedAt: string
}

