import { Type } from 'class-transformer'

export class CatalogItem {
  static api: any

  id: number
  uid: string
  schema: string
  name: string
  description: string
  meta: Object

  @Type(() => Date)
  publishedAt: string

  @Type(() => Date)
  detachedAt: string
}
