import bytes from 'bytes'
import isString from 'lodash/isString.js'
import sizeof from 'object-sizeof'
import { Type } from 'class-transformer'

import type { FileKey } from '../../interfaces'
import { ContentElement } from '../content-element'

export class ContentContainer {
  static api: any
  static fileKeyProp: FileKey = 'id'

  isLoaded = false

  id: number
  uid: string
  parentId: number
  type: string
  position: number
  publishedAs: string

  @Type(() => ContentElement)
  elements: ContentElement[]

  @Type(() => ContentContainer)
  containers: ContentContainer[]

  @Type(() => Date)
  createdAt: Date

  @Type(() => Date)
  updatedAt: Date

  get sourceKey(): string {
    const key = this[ContentContainer.fileKeyProp]
    return isString(key) ? key : String(key)
  }

  get fileExtension(): string {
    return `${this.publishedAs}.json`
  }

  get size(): string {
    return bytes(sizeof(this))
  }

  async makePublic(secondsAvailable?: number) {
    if (this.elements)
      await Promise.all(this.elements.map(it => it.makePublic(secondsAvailable)))

    if (this.containers)
      await Promise.all(this.containers.map(it => it.makePublic(secondsAvailable)))
  }
}
