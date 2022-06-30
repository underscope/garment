import bytes from 'bytes'
import sizeof from 'object-sizeof'
import { Type } from 'class-transformer'

export class ContentElement {
  static api: any

  id: number
  uid: string
  contentId: string
  contentSignature: string
  type: string
  position: number
  data: any
  meta: any
  refs: any

  @Type(() => Date)
  createdAt: Date

  @Type(() => Date)
  updatedAt: Date

  get size(): string {
    return bytes(sizeof(this))
  }
}
