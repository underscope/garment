export type GetObjectResponse<ContentType> = {
  raw: Buffer
  content: ContentType
}
