import bytes from 'bytes'
import set from 'lodash/set'
import sizeof from 'object-sizeof'
import { Type } from 'class-transformer'

// seconds, 12 hrs
const DEFAULT_ACCESS_TOKEN_INTERVAL = 12 * 60 * 60
const INTERNAL_STORAGE_PROTOCOL = 'storage://'

export class ContentElement {
  static api: any

  id: number
  uid: string
  contentId: string
  contentSignature: string
  type: string
  position: number
  refs: { [key: string]: any }
  meta: { [key: string]: any }
  data: {
    assets: { [key: string]: string }
  }

  @Type(() => Date)
  createdAt: Date

  @Type(() => Date)
  updatedAt: Date

  get size(): string {
    return bytes(sizeof(this))
  }

  makePublic(interval = DEFAULT_ACCESS_TOKEN_INTERVAL) {
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
    if (!this.data?.assets) return
    const assets = Object.entries(this.data.assets)
    await Promise.all(assets.map(async ([keyWithinData, url = '']) => {
      url = this.isStorageAsset(url)
        ? await this.getSignedAssetUrl(url, interval)
        : url
      set(this.data, keyWithinData, url)
    }))
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
