// seconds, 12 hrs
const DEFAULT_ACCESS_TOKEN_INTERVAL = 12 * 60 * 60
const INTERNAL_STORAGE_PROTOCOL = 'storage://'

interface MetaInputs { [key: string]: any }

function isStorageAsset(url: string) {
  return url.startsWith(INTERNAL_STORAGE_PROTOCOL)
}

function getAssetPath(url: string) {
  return url.substring(INTERNAL_STORAGE_PROTOCOL.length)
}

export default function (api: any) {
  function getSignedAssetUrl(url: string, interval: number) {
    return api.getSignedUrl(getAssetPath(url), interval)
  }

  // Signs all internal urls;
  // adds token param which enables access for a limited time.
  return function processMeta(
    inputs: MetaInputs,
    interval = DEFAULT_ACCESS_TOKEN_INTERVAL,
  ) {
    const meta = Object.entries(inputs)
    return Promise.all(meta.map(async ([_, value]) => {
      if (!value?.url || !isStorageAsset(value?.url))
        return Promise.resolve()
      value.publicUrl = await getSignedAssetUrl(value.url, interval)
    }))
  }
}
