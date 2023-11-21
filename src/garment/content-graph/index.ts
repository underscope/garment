export type Id = number
export type Uid = string
export type NodeType = 'A' | 'CC' | 'CE'
export type ParentId = number
export type PositionInAggregate = number

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
    this.activities = this.nodes.filter(it => it[2] !== 'CE')
    this.elements = this.nodes.filter(it => it[2] === 'CE')
  }

  findNodeByUid(uid: string): GraphNode | null {
    const node = this.nodes.find(it => it[1] === uid)
    if (!node) return null
    return this.formatNode(node)
  }

  findActivityById(id: number): GraphNode | null {
    const node = this.activities.find(it => it[0] === id)
    if (!node) return null
    return this.formatNode(node)
  }

  findElementById(id: number): GraphNode | null {
    const node = this.elements.find(it => it[0] === id)
    if (!node) return null
    return this.formatNode(node)
  }

  getNodePath(uid: string) {
    if (!uid) throw new Error('id is required')
    const node = this.findNodeByUid(uid)
    if (!node) return null
    if (node.type !== 'CC' && node.type !== 'CE')
      throw new Error('Node must be a content element or a container!')
    return node.type === 'CE'
      ? this.getElementPath(uid)
      : this.getContainerPath(uid)
  }

  getContainerPath(id: number | string) {
    if (!id) throw new Error('id is required')
    const node = typeof id === 'number'
      ? this.findActivityById(id)
      : this.findNodeByUid(id)
    if (!node) return null
    if (node.type !== 'CC') throw new Error('Node must be a container!')
    const [activity, ...subPath] = this.resolveNodeLocation(node.parentId)
    const [rootContainer, ...nestedContainers] = subPath?.length > 0
      ? [...subPath, node]
      : [node]
    return {
      outlineActivity: activity,
      rootContainer,
      path: nestedContainers?.length
        ? this.constructContainerPath(nestedContainers)
        : '',
    }
  }

  getElementPath(id: number | string) {
    if (!id) throw new Error('id is required')
    const node = typeof id === 'number'
      ? this.findElementById(id)
      : this.findNodeByUid(id)
    if (!node) return null
    if (node.type !== 'CE') throw new Error('Node must be a content element!')
    const [activity, container, ...subPath]
      = this.resolveNodeLocation(node.parentId)
    return {
      outlineActivity: activity,
      rootContainer: container,
      path: this.constructElementPath(subPath, node),
    }
  }

  private constructContainerPath(
    subPath: Array<GraphNode> = [],
  ): string {
    return subPath.reduce((acc, it) => {
      return `${acc}containers.${it.positionInAggregate}.`
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
    if (!node) throw new Error(`Activity with id ${parentActivityId} not found`)
    if (node.type === 'A') return [node, ...path]
    return this.resolveNodeLocation(node.parentId, [node, ...path])
  }

  private formatNode(node: GraphNodeArray): GraphNode {
    const [id, uid, type, parentId, positionInAggregate] = node
    return { id, uid, type, parentId, positionInAggregate }
  }

  toJSON(): Array<GraphNodeArray> {
    return this.nodes
  }
}
