## 3. Delete files from S3

It is the fifth part of the series where we are building a file storage application with Next.js, Prisma, and Minio. In this part, we will learn how to delete files from the S3 bucket and the database.

![Delete files from S3 Diagram](/blog-assets/file-storage-nextjs-postgres-s3/delete-file-diagram.png)

### Frontend - Delete files from S3

File deletion can be done using a DELETE request to the API route. I created a delete function in FileItem component, which sends a DELETE request to the API route to delete the file from the S3 bucket and the database.

The algorithm for deleting files from S3:

- Remove the file from the list of files on the client immediately.
- Send a DELETE request to the API route to delete the file from the S3 bucket and the database.
- Fetch the files after deleting.

Here is an example of the delete function in the FileItem component:

```tsx filename="src/components/FileItem.tsx" copy
async function deleteFile(id: string) {
  // remove file from the list of files on the client
  setFiles((files: FileProps[]) =>
    files.map((file: FileProps) => (file.id === id ? { ...file, isDeleting: true } : file))
  )
  try {
    // delete file request to the server
    await fetch(`/api/files/delete/${id}`, {
      method: 'DELETE',
    })
    // fetch files after deleting
    await fetchFiles()
  } catch (error) {
    console.error(error)
    alert('Failed to delete file')
  } finally {
    // remove isDeleting flag from the file
    setFiles((files: FileProps[]) =>
      files.map((file: FileProps) => (file.id === id ? { ...file, isDeleting: false } : file))
    )
  }
}
```

### Backend - Delete files from S3

#### 1. Create a utility function to delete files from S3

To delete files from S3, we will create a utility function `deleteFileFromBucket` that uses the [`removeObject` method](https://min.io/docs/minio/linux/developers/javascript/API.html#removeobject-bucketname-objectname-removeopts-callback) of the Minio client to delete the file from the S3 bucket.

```ts filename="src/utils/s3-file-management.ts" copy
/**
 * Delete file from S3 bucket
 * @param bucketName name of the bucket
 * @param fileName name of the file
 * @returns true if file was deleted, false if not
 */
export async function deleteFileFromBucket({ bucketName, fileName }: { bucketName: string; fileName: string }) {
  try {
    await s3Client.removeObject(bucketName, fileName)
  } catch (error) {
    console.error(error)
    return false
  }
  return true
}
```

#### 2. Create an API route to delete files from S3

Here is an example of an API route to delete files from S3. Create a file `delete/[id].ts` in the `pages/api/files/delete` folder. This file will delete the file from the S3 bucket and the database.

The algorithm for deleting files from S3:

- Get the file name in the bucket from the database using the file id.
- Check if the file exists in the database.
- Delete the file from the S3 bucket using the `deleteFileFromBucket` function.
- Delete the file from the database using the Prisma `file.delete` method.
- Return the status and message in the response to the client.

```ts filename="src/pages/api/files/delete/[id].ts" copy
import type { NextApiRequest, NextApiResponse } from 'next'
import { deleteFileFromBucket } from '~/utils/s3-file-management'
import { db } from '~/server/db'
import { env } from '~/env'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    res.status(405).json({ message: 'Only DELETE requests are allowed' })
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
  // Delete the file from the bucket
  await deleteFileFromBucket({
    bucketName: env.S3_BUCKET_NAME,
    fileName: fileObject?.fileName,
  })
  // Delete the file from the database
  const deletedItem = await db.file.delete({
    where: {
      id,
    },
  })

  if (deletedItem) {
    res.status(200).json({ message: 'Item deleted successfully' })
  } else {
    res.status(404).json({ message: 'Item not found' })
  }
}
```

Thanks for reading the fifth part of
the series "File storage with Next.js, PostgreSQL, and Minio S3". In the next part, we will deploy the application locally using Docker Compose.

If you have any questions or suggestions, feel free to leave a comment below.

Breif summary of the article for search engines: In this article, we will learn how to delete files from the S3 bucket and the database. We will create a delete function in the FileItem component, which sends a DELETE request to the API route to delete the file from the S3 bucket and the database. We will also create a utility function to delete files from the S3 bucket and an API route to delete files from the S3 bucket and the database.

[]: # (tags: Next.js Prisma Minio S3 PostgreSQL)
[]: # (teaser: Learn how to delete files from the S3 bucket and the database. We will create a delete function in the FileItem component, which sends a DELETE request to the API route to delete the file from the S3 bucket and the database. We will also create a utility function to delete files from the S3 bucket and an API route to delete files from the S3 bucket and the database.)
[]: # (publishedAt: 2022-03-01)
[]: # (updatedAt: 2022-03-01)
