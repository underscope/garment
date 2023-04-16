import { Type } from 'class-transformer'

export class CatalogEntry {
  static api: any

  id: number
  uid: string
  schema: string
  name: string
  description: string
  meta: { [key: string]: any }

  async makePublic(interval?: number): Promise<CatalogEntry> {
    await CatalogEntry.api.processMeta(this.meta, interval)
    return this
  }

  @Type(() => Date)
  publishedAt: string

  @Type(() => Date)
  detachedAt: string
}
