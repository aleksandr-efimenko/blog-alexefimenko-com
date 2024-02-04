## 2.1 Upload files using presigned URLs

![Upload files using presigned URLs Diagram](/blog-assets/file-storage-nextjs-postgres-s3/presigned-urls-upload-diagram.png)

In the diagram above, we can see the steps involved in uploading and downloading files using presigned URLs. It is a more complex approach, but it does not use resources on the Next.js server with file uploads. The presigned URL is generated on the server and sent to the client. The client uses the presigned URL to upload the file directly to S3.

To upload files:

1. The user sends a POST request to the API route with the file info to upload.
2. The API route sends requests to S3 to generate presigned URLs for each file.
3. The S3 returns the presigned URLs to the API route.
4. The API route sends the presigned URLs to the client.
5. The client uploads the files directly to S3 using the presigned URLs and PUT requests.
6. The client sends the file info to the API route to save the file info.
7. The API route saves the file info to the database.

### Frontend - Upload form logic for presigned URLs

#### 1. Create function to send request to Next.js API route to get presigned URLs

```ts filename="src/utils/fileUploadHelpers.ts" copy
/**
 * Gets presigned urls for uploading files to S3
 * @param formData form data with files to upload
 * @returns
 */
export const getPresignedUrls = async (files: ShortFileProp[]) => {
  const response = await fetch('/api/files/upload/presignedUrl', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(files),
  })
  return (await response.json()) as PresignedUrlProp[]
}
```

#### 2. Create function to upload files using PUT request to S3 with presigned URL

The function `uploadToS3` sends a PUT request to the presigned URL to upload the file to S3.

```ts filename="src/utils/fileUploadHelpers.ts" copy
/**
 * Uploads file to S3 directly using presigned url
 * @param presignedUrl presigned url for uploading
 * @param file  file to upload
 * @returns  response from S3
 */
export const uploadToS3 = async (presignedUrl: PresignedUrlProp, file: File) => {
  const response = await fetch(presignedUrl.url, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': file.type,
      'Access-Control-Allow-Origin': '*',
    },
  })
  return response
}
```

#### 3. Create function to save file info in the database

The function `saveFileInfoInDB` sends a POST request to the API route to save the file info in the database.

```ts filename="src/utils/fileUploadHelpers.ts" copy
/**
 * Saves file info in DB
 * @param presignedUrls presigned urls for uploading
 * @returns
 */
export const saveFileInfoInDB = async (presignedUrls: PresignedUrlProp[]) => {
  return await fetch('/api/files/upload/saveFileInfo', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(presignedUrls),
  })
}
```

#### 4. Create a form to upload files using presigned URLs

```ts filename="src/utils/fileUploadHelpers.ts" copy
/**
 * Uploads files to S3 and saves file info in DB
 * @param files files to upload
 * @param presignedUrls  presigned urls for uploading
 * @param onUploadSuccess callback to execute after successful upload
 * @returns
 */
export const handleUpload = async (files: File[], presignedUrls: PresignedUrlProp[], onUploadSuccess: () => void) => {
  const uploadToS3Response = await Promise.all(
    presignedUrls.map((presignedUrl) => {
      const file = files.find(
        (file) => file.name === presignedUrl.originalFileName && file.size === presignedUrl.fileSize
      )
      if (!file) {
        throw new Error('File not found')
      }
      return uploadToS3(presignedUrl, file)
    })
  )

  if (uploadToS3Response.some((res) => res.status !== 200)) {
    alert('Upload failed')
    return
  }

  await saveFileInfoInDB(presignedUrls)
  onUploadSuccess()
}
```

#### 5. Create a form to upload files using presigned URLs using functions from the previous steps

Here I show a simplified version of the file, without validation, loading state, and error handling.

```tsx filename="src/components/UploadFilesForm/UploadFilesS3PresignedUrl.tsx" copy
import { useState, useRef } from 'react'
import { validateFiles, MAX_FILE_SIZE_S3_ENDPOINT, handleUpload, getPresignedUrls } from '~/utils/fileUploadHelpers'
import { UploadFilesFormUI } from './UploadFilesFormUI'
import { type ShortFileProp } from '~/utils/types'

type UploadFilesFormProps = {
  onUploadSuccess: () => void
}

export function UploadFilesS3PresignedUrl({ onUploadSuccess }: UploadFilesFormProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const uploadToServer = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    // get File[] from FileList
    const files = Object.values(fileInputRef.current.files)
    // validate files
    const filesInfo: ShortFileProp[] = files.map((file) => ({
      originalFileName: file.name,
      fileSize: file.size,
    }))

    const presignedUrls = await getPresignedUrls(filesInfo)

    // upload files to s3 endpoint directly and save file info to db
    await handleUpload(files, presignedUrls, onUploadSuccess)

    setIsLoading(false)
  }

  return (
    <UploadFilesFormUI
      isLoading={isLoading}
      fileInputRef={fileInputRef}
      uploadToServer={uploadToServer}
      maxFileSize={MAX_FILE_SIZE_S3_ENDPOINT}
    />
  )
}
```

### Backend - Upload files using presigned URLs

#### 1. Create helper function to generate presigned URLs for uploading files to S3

```ts filename="src/utils/s3-file-management.ts" copy
/**
 * Generate presigned urls for uploading files to S3
 * @param files files to upload
 * @returns promise with array of presigned urls
 */
export async function createPresignedUrlToUpload({
  bucketName,
  fileName,
  expiry = 60 * 60, // 1 hour
}: {
  bucketName: string
  fileName: string
  expiry?: number
}) {
  // Create bucket if it doesn't exist
  await createBucketIfNotExists(bucketName)

  return await s3Client.presignedPutObject(bucketName, fileName, expiry)
}
```

#### 2. Create an API route to send requests to S3 to generate presigned URLs for each file

In this approach, we do not use formidable to parse the incoming request, so we do not need to disable the built-in body parser of Next.js. We can use the default body parser.

The algorithm for generating presigned URLs for uploading files to S3:

- Get the files info from the request body.
- Check if there are files to upload.
- Create an empty array to store the presigned URLs.

For each file:

- Generate a unique file name using the nanoid library.
- Get the presigned URL using the `createPresignedUrlToUpload` function.
- Add the presigned URL to the array.

Then return the array of presigned URLs in the response to the client.

```ts filename="src/pages/api/files/upload/presignedUrl.ts" copy
import type { NextApiRequest, NextApiResponse } from 'next'
import type { ShortFileProp, PresignedUrlProp } from '~/utils/types'
import { createPresignedUrlToUpload } from '~/utils/s3-file-management'
import { env } from '~/env'
import { nanoid } from 'nanoid'

const bucketName = env.S3_BUCKET_NAME
const expiry = 60 * 60 // 24 hours

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Only POST requests are allowed' })
    return
  }
  // get the files from the request body
  const files = req.body as ShortFileProp[]

  if (!files?.length) {
    res.status(400).json({ message: 'No files to upload' })
    return
  }

  const presignedUrls = [] as PresignedUrlProp[]

  if (files?.length) {
    // use Promise.all to get all the presigned urls in parallel
    await Promise.all(
      // loop through the files
      files.map(async (file) => {
        const fileName = `${nanoid(5)}-${file?.originalFileName}`

        // get presigned url using s3 sdk
        const url = await createPresignedUrlToUpload({
          bucketName,
          fileName,
          expiry,
        })
        // add presigned url to the list
        presignedUrls.push({
          fileNameInBucket: fileName,
          originalFileName: file.originalFileName,
          fileSize: file.fileSize,
          url,
        })
      })
    )
  }

  res.status(200).json(presignedUrls)
}
```

#### 3. Create an API route to save file info in the database with Prisma

The algorithm for saving file info in the database:

- Get the file info from the request body.
- Save the file info to the database using the Prisma `file.create` method.
- Return the status and message in the response to the client.

```ts filename="src/pages/api/files/upload/saveFileInfo.ts" copy
import type { NextApiRequest, NextApiResponse } from 'next'
import { env } from '~/env'
import { db } from '~/server/db'
import type { PresignedUrlProp, FileInDBProp } from '~/utils/types'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Only POST requests are allowed' })
    return
  }

  const presignedUrls = req.body as PresignedUrlProp[]

  // Get the file name in bucket from the database
  const saveFilesInfo = await db.file.createMany({
    data: presignedUrls.map((file: FileInDBProp) => ({
      bucket: env.S3_BUCKET_NAME,
      fileName: file.fileNameInBucket,
      originalName: file.originalFileName,
      size: file.fileSize,
    })),
  })

  if (saveFilesInfo) {
    res.status(200).json({ message: 'Files saved successfully' })
  } else {
    res.status(404).json({ message: 'Files not found' })
  }
}
```

## 2.2 Download files using presigned URLs

![Download files using presigned URLs Diagram](/blog-assets/file-storage-nextjs-postgres-s3/presigned-urls-dowload-diagram.png)

To download files:

1. The user sends a GET request with file id to the API route to get file.
2. The API route sends a request to the database to get the file name and receives the file name.
3. The API route sends a request to S3 to generate a presigned URL for the file and receives the presigned URL.
4. The API route sends the presigned URL to the client.
5. The client downloads the file directly from S3 using the presigned URL.

### Frontend - Download files using presigned URLs

To download files, we will create a function `downloadFile` inside of the FileItem component. The function sends a GET request to the API route to get the presigned URL for the file from S3. The file is returned to the user from the API route.

```ts filename="src/utils/fileUploadHelpers.ts" copy
async function getPresignedUrl(file: FileProps) {
  const response = await fetch(`/api/files/download/presignedUrl/${file.id}`)
  return (await response.json()) as string
}

const downloadFile = async (file: FileProps) => {
  const presignedUrl = await getPresignedUrl(file)
  window.open(presignedUrl, '_blank')
}
```

### Backend - Download files using presigned URLs

#### 1. Create helper function to generate presigned URLs for downloading files from S3

To download files from S3, we will create a utility function `createPresignedUrlToDownload` that uses the [`presignedGetObject` method](https://min.io/docs/minio/javascript-client-api-reference#presignedGetObject) of the Minio client to generate a presigned URL for the file.

```ts filename="src/utils/s3-file-management.ts" copy
export async function createPresignedUrlToDownload({
  bucketName,
  fileName,
  expiry = 60 * 60, // 1 hour
}: {
  bucketName: string
  fileName: string
  expiry?: number
}) {
  return await s3Client.presignedGetObject(bucketName, fileName, expiry)
}
```

#### 2. Create an API route to send requests to S3 to generate presigned URLs for each file

The algorithm for generating presigned URLs for downloading files from S3:

- Get the file name from the database using the file id.
- Get the presigned URL using the `createPresignedUrlToDownload` function.
- Return the presigned URL in the response to the client.

```ts filename="src/pages/api/files/download/presignedUrl/[id].ts" copy
import type { NextApiRequest, NextApiResponse } from 'next'
import { createPresignedUrlToDownload } from '~/utils/s3-file-management'
import { db } from '~/server/db'
import { env } from '~/env'

/**
 * This route is used to get presigned url for downloading file from S3
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ message: 'Only GET requests are allowed' })
  }

  const { id } = req.query

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'Missing or invalid id' })
  }

  // Get the file name in bucket from the database
  const fileObject = await db.file.findUnique({
    where: {
      id,
    },
    select: {
      fileName: true,
    },
  })

  if (!fileObject) {
    return res.status(404).json({ message: 'Item not found' })
  }

  // Get presigned url from s3 storage
  const presignedUrl = await createPresignedUrlToDownload({
    bucketName: env.S3_BUCKET_NAME,
    fileName: fileObject?.fileName,
  })

  res.status(200).json(presignedUrl)
}
```

Thanks for reading the forth part of the series "File storage with Next.js, PostgreSQL, and Minio S3". In the next part, we will implement deleting files from the database and S3.

If you have any questions or suggestions, feel free to leave a comment below.

Brief summary of the article for search engines: In this article, we learned how to upload and download files using presigned URLs. We created a function to send a request to the Next.js API route to get presigned URLs for uploading files to S3. We created a function to upload files using a PUT request to S3 with a presigned URL. We created a function to save file info in the database. We created a form to upload files using presigned URLs. We created a function to send a request to the Next.js API route to get a presigned URL for downloading files from S3. We created a function to download files using presigned URLs. We created an API route to send requests to S3 to generate presigned URLs for each file. We created an API route to save file info in the database with Prisma. We created a helper function to generate presigned URLs for uploading files to S3. We created an API route to send requests to S3 to generate presigned URLs for each file. We created a helper function to generate presigned URLs for downloading files from S3. We created an API route to send requests to S3 to generate presigned URLs for each file.
