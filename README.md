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
- `type` - Activity, Content Container or Content element
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

```js
{
  "id": 7640,
  "uid": "6191eb25-cc47-49d9-ba4c-bdadea915f7f",
  "type": "CE", // Content Element
  "parentId": 6089,
  "positionInAggregate": 0
}
```

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

which will return the properties below:

```js
{
  // Activity leaf
  // The node in the outline structure the content is attached to
  "activity": {
    "id": 6068,
    "uid": "125b1510-beab-437e-b47e-d79e24dbc94a",
    "type": "A",
    "parentId": 6061
  },
  // Location within the activity leaf
  "activityPath": "contentContainers.0.containers.1.elements.2",
  // Content Container activity containing the content
  "contentContainer": {
    "id": 6071,
    "uid": "e0f6b697-d8f5-438a-bb27-16d37ab336ff",
    "type": "CC",
    "parentId": 6068,
    "positionInAggregate": 0
  },
  // Location within the Content Container; empty string if that particular
  // Content Container was searched for (in this example it is element) within
  // sub content container
  "contentContainerPath": "containers.1.elements.2"
}
```
