export interface GetObjectResponse<ContentType> {
  raw: Buffer
  content: ContentType
}
