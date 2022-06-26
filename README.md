# 👕 Garment

Utility for managing published Tailor content.

Initialize garment by providing storage provider configuration.

```js
const garment = new Garment({
  provider: 'aws',
  bucket: 'my-bucket',
  aws: {
    keyId: 'aws-key',
    secretKey: 'aws-secret',
    region: 'eu-central-1'
  },
});
```

## API

### Fetching published resources

#### `list()`
Retrieves the list of published repositories

#### `get(id: string)`
Retrieves repository root file, containing the repository outline (structure)

#### `getContainer(id: string, repositoryId: string)`
Retrieves content container
