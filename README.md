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
});
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
