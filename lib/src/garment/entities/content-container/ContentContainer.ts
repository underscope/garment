import type { FileKey } from '../../interfaces'
import bytes from 'bytes'
import { Type } from 'class-transformer'
import isString from 'lodash/isString.js'

import sizeof from 'object-sizeof'
import { type GraphNodeArray, NodeType } from '../../content-graph'
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
  data: { [key: string]: any }

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

  getSubtreeDescriptors(
    parentActivityId: number,
    positionInAggregate: number,
  ): Array<GraphNodeArray> {
    const node = [
      this.id,
      this.uid,
      NodeType.CONTENT_CONTAINER,
      parentActivityId,
      positionInAggregate,
    ]
    const childElements = this.elements?.length
      ? this.elements.map((it, i) => it.getNodeDescriptor(this.id, i))
      : []
    const childContainers = this.containers?.length
      ? this.containers.reduce(
        (acc, it, i) => acc.concat(it.getSubtreeDescriptors(this.id, i)),
        [] as any,
      )
      : []
    return [node, ...childElements, ...childContainers]
  }
}
