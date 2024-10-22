# 👕 Garment

Utility for managing published Tailor content. Provides ability to:
- ✅ list published repositories
- ✅ load Repository instance and all nested entities (Activities, Content Containers, Content Elements)
- ✅ snapshot repository
- ✅ load from snapshot
- ✅ sign ContentElement assets for delivery
- 🚧 cache presigned Repository instance

Initialize garment by providing storage provider configuration.

```js
const garment = new Garment({
  provider: 'aws',
  bucket: 'my-bucket',
  aws: {
    keyId: 'aws-key',
    secretKey: 'aws-secret',
    region: 'eu-central-1'
  }
})
```

## API

### Fetching resources

Retrieve the list of published repositories
```js
garment.source().list()
```

Retrieve repository from source dir (published version)
```js
garment.source().get(id)
```

Retrieve repository snapshot
```js
garment.snapshot().get(id, version)
```

### Content graph

Garment enables the ability to load all content structure nodes. Nodes consist
of:

- `id`
- `uid`
- `type` - Activity, Content Container or Content Element
- `parentId`
- `positionInAggregate` - location within the aggregate array;
  if denormalized object

```js
const repository = await garment.source().get(1)
const contentGraph = await repository.getContentGraph()
```

From that point, we can fetch any node and traverse content structure via
`parentId`.

```js
// Find any node type by uid
contentGraph.findNodeByUid('dbf2ef31-59b4-4d77-9a20-a3d4dff0789e')
// Find Content Element node by id
contentGraph.findElementById(805)
// Find Activity node by id (or Content Container; subtype)
contentGraph.findActivityById(805)
```

which will return the properties below:

```json
{
  "id": 7640,
  "uid": "6191eb25-cc47-49d9-ba4c-bdadea915f7f",
  "type": "CE",
  "parentId": 6089,
  "positionInAggregate": 0
}
```

To get a list of all of the ancestors, use `getAncestors(uid)` method.

Content graph makes it simple to resolve where specific `Content Container` or
`Content Element` is, so we can retrieve only content items we need (and we
can more easily navigate within a aggregate structure; e.g. if we want to
get a specific `Content Element` which might be located in a
`Content Container`). To resolve `Content Container` or a `Content Element`
location, use:

```js
// Get Content Container or Content Element path by uid
contentGraph.getNodePath('58f1e05d-e7e1-4cc2-ac9b-4d50f44fd64c')
// Get Content Container path by id
contentGraph.getContainerPath(986)
// Get Content Element path by id
contentGraph.getElementPath(805)
```

which will return the:

- `outline` - Location within the outline
- `activity` - `Activity` leaf; the node in the outline structure the content is
  attached to
- `activityPath` - Location within the `Activity` leaf
- `contentContainer` - `ContentContainer` activity containing the content
- `contentContainerPath` - Location within the `ContentContainer`; empty string if
  that particular `ContentContainer` was searched for (in this example it is a
  element) within the sub `ContentContainer`

```json
{
  "outline": [
    {
      "id": 5997,
      "uid": "02b091f6-c920-4d3b-a429-3dd51fcb9b4e",
      "type": "A",
      "parentId": null
    },
    {
      "id": 6068,
      "uid": "0af7eefc-0e45-4e2a-af01-70f6dff1ab72",
      "type": "A",
      "parentId": 5997
    }
  ],
  "activity": {
    "id": 6068,
    "uid": "125b1510-beab-437e-b47e-d79e24dbc94a",
    "type": "A",
    "parentId": 5997
  },
  "activityPath": "contentContainers.0.containers.1.elements.2",
  "contentContainer": {
    "id": 6071,
    "uid": "e0f6b697-d8f5-438a-bb27-16d37ab336ff",
    "type": "CC",
    "parentId": 6068,
    "positionInAggregate": 0
  },
  "contentContainerPath": "containers.1.elements.2"
}
```

#### Storage

To store the ContentGraph data simply call `toJSON()` method and store the
output. You can use the stored data to instantiate new `ContentGraph`:

```js
const data = contentGraph.toJSON()
const newGraph = new ContentGraph(data)
```
