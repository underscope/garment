import 'dotenv/config'

import s3FolderUpload from 's3-folder-upload'
import storageCredentials from '../config.js'

s3FolderUpload('examples/content', storageCredentials, {
  useFoldersForFileTypes: false,
  useIAMRoleCredentials: false,
  ACL: 'private',
})
