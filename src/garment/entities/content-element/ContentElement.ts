import { Transform, Type } from 'class-transformer'
import bytes from 'bytes'
import camelCase from 'camelcase'
import set from 'lodash/set.js'
import sizeof from 'object-sizeof'

// seconds, 12 hrs
const DEFAULT_ACCESS_TOKEN_INTERVAL = 12 * 60 * 60
const INTERNAL_STORAGE_PROTOCOL = 'storage://'

export class ContentElement {
  static api: any
  static customProcessorRegistry: (type: string) => Function

  id: number
  uid: string
  contentId: string
  contentSignature: string
  type: string
  position: number
  refs: { [key: string]: any }
  meta: { [key: string]: any }

  // Inject type for protobuf
  @Transform(({ value, obj }) => ({
    ...value,
    '@type': camelCase(obj.type, { pascalCase: true }),
  }))
  data: {
    assets: { [key: string]: string }
    [key: string]: any
  }

  @Type(() => Date)
  createdAt: Date

  @Type(() => Date)
  updatedAt: Date

  get size(): string {
    return bytes(sizeof(this))
  }

  get customProcessor(): any {
    return ContentElement.customProcessorRegistry?.(this.type)
  }

  async makePublic(interval = DEFAULT_ACCESS_TOKEN_INTERVAL) {
    if (this.customProcessor) await this.customProcessor(this)
    return this.processAssets(interval)
  }

  /**
   * Signs all asset urls within the data.assets key-value pair definition;
   * adds token param which enables access for a limited time.
   * Key denotes location within the data property where the resolved asset url
   * should be set (e.g. assets['deep.url'] = 'storage://test.png' should
   * result in signed 'storage://test.png' url set on data['deep.url'] path).
   */
  private async processAssets(interval: number) {
    if (!this.data?.assets) {
      // Support legacy image format
      if (this.type === 'IMAGE' && this.data?.url.startsWith('repository/'))
        this.processLegacyImageElement()
      else
        return
    }

    const assets = Object.entries(this.data.assets)
    await Promise.all(assets.map(async ([keyWithinData, url = '']) => {
      url = this.isStorageAsset(url)
        ? await this.getSignedAssetUrl(url, interval)
        : url
      set(this.data, keyWithinData, url)
    }))
  }

  private async processLegacyImageElement() {
    this.data.assets = { url: `${INTERNAL_STORAGE_PROTOCOL}${this.data.url}` }
  }

  private getSignedAssetUrl(url: string, interval: number) {
    return ContentElement.api.getSignedUrl(this.getAssetPath(url), interval)
  }

  private isStorageAsset(url: string) {
    return url.startsWith(INTERNAL_STORAGE_PROTOCOL)
  }

  private getAssetPath(url: string) {
    return url.substring(INTERNAL_STORAGE_PROTOCOL.length)
  }
}
