export type Id = number
export type Uid = string
export type ParentId = number
export type PositionInAggregate = number

export enum NodeType {
  ACTIVITY = 'A',
  CONTENT_CONTAINER = 'CC',
  CONTENT_ELEMENT = 'CE',
}

export interface GraphNode {
  id: Id
  uid: Uid
  type: NodeType
  parentId: ParentId
  positionInAggregate: PositionInAggregate
}

export type GraphNodeArray = [
  Id,
  Uid,
  NodeType,
  ParentId,
  PositionInAggregate,
]

export class ContentGraph {
  nodes: GraphNodeArray[]
  activities: GraphNodeArray[]
  elements: GraphNodeArray[]

  constructor(nodes: GraphNodeArray[]) {
    this.nodes = nodes
    this.activities = this.nodes.filter(it => it[2] !== NodeType.CONTENT_ELEMENT)
    this.elements = this.nodes.filter(it => it[2] === NodeType.CONTENT_ELEMENT)
  }

  findNodeByUid(uid: string): GraphNode | null {
    const node = this.nodes.find(it => it[1] === uid)
    if (!node)
      return null
    return this.formatNode(node)
  }

  findActivityById(id: number): GraphNode | null {
    const node = this.activities.find(it => it[0] === id)
    if (!node)
      return null
    return this.formatNode(node)
  }

  findElementById(id: number): GraphNode | null {
    const node = this.elements.find(it => it[0] === id)
    if (!node)
      return null
    return this.formatNode(node)
  }

  getNodePath(uid: string) {
    if (!uid)
      throw new Error('uid is required')
    const node = this.findNodeByUid(uid)
    if (!node)
      return null
    if (
      node.type !== NodeType.CONTENT_CONTAINER
      && node.type !== NodeType.CONTENT_ELEMENT
    ) {
      throw new Error('Node must be a content element or a container!')
    }
    return node.type === NodeType.CONTENT_ELEMENT
      ? this.getElementPath(uid)
      : this.getContainerPath(uid)
  }

  getContainerPath(id: number | string) {
    if (!id)
      throw new Error('id is required')
    const node = typeof id === 'number'
      ? this.findActivityById(id)
      : this.findNodeByUid(id)
    if (!node)
      return null
    if (node.type !== NodeType.CONTENT_CONTAINER)
      throw new Error('Node must be a container!')
    const [activity, ...subPath] = this.resolveNodeLocation(node.parentId)
    const [rootContainer, ...nestedContainers] = subPath?.length > 0
      ? [...subPath, node]
      : [node]
    const containerInActivityPathPrefix = this.getContainerInActivityPathPrefix(
      rootContainer.positionInAggregate,
    )
    const containerPath = nestedContainers?.length
      ? this.constructContainerPath(nestedContainers)
      : null
    const activityPath = containerInActivityPathPrefix
      + (containerPath ? `.${containerPath}` : '')
    return {
      outline: this.getAncestors(rootContainer.uid),
      activity,
      activityPath,
      contentContainer: rootContainer,
      contentContainerPath: containerPath,
    }
  }

  getElementPath(id: number | string) {
    if (!id)
      throw new Error('id is required')
    const node = typeof id === 'number'
      ? this.findElementById(id)
      : this.findNodeByUid(id)
    if (!node)
      return null
    if (node.type !== NodeType.CONTENT_ELEMENT)
      throw new Error('Node must be a content element!')
    const [activity, container, ...subPath]
      = this.resolveNodeLocation(node.parentId)
    const containerInActivityPathPrefix = this.getContainerInActivityPathPrefix(
      container.positionInAggregate,
    )
    const containerPath = this.constructElementPath(subPath, node)
    const activityPath = `${containerInActivityPathPrefix}.${containerPath}`
    return {
      outline: this.getAncestors(container.uid),
      activity,
      activityPath,
      contentContainer: container,
      contentContainerPath: containerPath,
    }
  }

  // Loveable naming
  private getContainerInActivityPathPrefix(positionInAggregate: number) {
    return `contentContainers.${positionInAggregate}`
  }

  private constructContainerPath(
    subPath: Array<GraphNode> = [],
  ): string {
    return subPath.reduce((acc, it) => {
      if (acc !== '')
        acc += '.'
      return `${acc}containers.${it.positionInAggregate}`
    }, '')
  }

  private constructElementPath(
    subPath: Array<GraphNode> = [],
    node: GraphNode,
  ): string {
    const rootPath = subPath.reduce((acc, it) => {
      return `${acc}containers.${it.positionInAggregate}.`
    }, '')
    return `${rootPath}elements.${node.positionInAggregate}`
  }

  // Go up the tree until we find an Activity node
  private resolveNodeLocation(
    parentActivityId: number,
    path: Array<GraphNode> = [],
  ): Array<GraphNode> {
    const node = this.findActivityById(parentActivityId)
    if (!node)
      throw new Error(`Activity with id ${parentActivityId} not found`)
    if (node.type === NodeType.ACTIVITY)
      return [node, ...path]
    return this.resolveNodeLocation(node.parentId, [node, ...path])
  }

  private formatNode(node: GraphNodeArray): GraphNode {
    const [id, uid, type, parentId, positionInAggregate] = node
    return { id, uid, type, parentId, positionInAggregate }
  }

  getAncestors(uid: string): Array<GraphNode> {
    const node = this.findNodeByUid(uid)
    if (!node)
      throw new Error(`Node with uid ${uid} not found`)
    if (!node.parentId)
      return []
    return this.getActivityAncestors(node.parentId)
  }

  private getActivityAncestors(
    id: number,
    path: Array<GraphNode> = [],
  ): Array<GraphNode> {
    const node = this.findActivityById(id)
    if (!node)
      throw new Error(`Node with id ${id} not found`)
    const lineage = [node, ...path]
    if (!node.parentId)
      return lineage
    return this.getActivityAncestors(node.parentId, lineage)
  }

  toJSON(): Array<GraphNodeArray> {
    return this.nodes
  }
}
