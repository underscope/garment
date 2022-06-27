import { Type } from 'class-transformer'

export class Repository {
  id: number
  uid: string
  schema: string
  name: string
  description: string
  version: string
  structure: Activity[]

  @Type(() => Date)
  publishedAt: Date
}

export class Activity {
  id: number
  uid: string
  type: string
  position: number
  meta: Object
  contentContainers: Object[]
  relationships: Object

  @Type(() => Date)
  createdAt: Date

  @Type(() => Date)
  updatedAt: Date

  @Type(() => Date)
  publishedAt: Date
}
