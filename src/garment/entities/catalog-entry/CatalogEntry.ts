import { Type } from 'class-transformer'

export class CatalogEntry {
  static api: any

  id: number
  uid: string
  schema: string
  name: string
  description: string
  meta: { [key: string]: any }

  @Type(() => Date)
  publishedAt: string

  @Type(() => Date)
  detachedAt: string
}
