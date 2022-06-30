import bytes from 'bytes'
import sizeof from 'object-sizeof'
import { Type } from 'class-transformer'

export class Activity {
  static api: any
  isLoaded = false

  id: number
  uid: string
  repositoryId: number
  type: string
  position: number
  relationships: Object
  meta: Object
  contentContainers: any[]

  @Type(() => Date)
  createdAt: Date

  @Type(() => Date)
  updatedAt: Date

  @Type(() => Date)
  publishedAt: Date

  get size(): string {
    return bytes(sizeof(this))
  }

  async load(): Promise<Activity> {
    const fetchContainers = this.contentContainers.map((it) => {
      return Activity.api.getContainer(it.id.toString(), this.repositoryId.toString())
    })
    await Promise
      .all(fetchContainers)
      .then((containers) => {
        this.isLoaded = true
        this.contentContainers = containers
      })
    this.isLoaded = true
    return this
  }
}
