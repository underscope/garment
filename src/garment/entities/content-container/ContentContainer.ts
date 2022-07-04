import bytes from 'bytes'
import isString from 'lodash/isString'
import sizeof from 'object-sizeof'
import { Type } from 'class-transformer'

import { ContentElement } from '../content-element'

export class ContentContainer {
  static api: any
  static fileKeyProp: 'id' | 'uid' = 'id'

  isLoaded = false

  id: number
  uid: string
  parentId: number
  type: string
  position: number

  @Type(() => ContentElement)
  elements: ContentElement[]

  @Type(() => Date)
  createdAt: Date

  @Type(() => Date)
  updatedAt: Date

  get fileKey(): string {
    const key = this[ContentContainer.fileKeyProp]
    return isString(key) ? key : String(key)
  }

  get size(): string {
    return bytes(sizeof(this))
  }

  makePublic(secondsAvailable?: number) {
    return Promise.all(this.elements.map(it => it.makePublic(secondsAvailable)))
  }
}
