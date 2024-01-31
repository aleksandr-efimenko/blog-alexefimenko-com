---
title: Building a File Storage With Next.js, PostgreSQL, and Minio S3
description: In this article, we will build a full-stack application using Next.js, PostgreSQL, and Minio S3.
date: 2024-01-31
tags: [nextjs, react, postgres, minio, docker]
image: /blog-assets/file-storage-nextjs-postgres-s3/cover.png
thumbnail: /blog/nextjs-postgres-s3-locally/cover.png
---

# Building a file storage with Next.js, PostgreSQL, and Minio S3

![Building a file storage with Next.js, PostgreSQL, and Minio S3](/blog-assets/file-storage-nextjs-postgres-s3/cover.png)

It is the second part of the series of articles about building a file storage with Next.js, PostgreSQL, and Minio S3. In [the first part](http://blog.alexefimenko.com/posts/nextjs-postgres-s3-locally), we have set up the development environment using Docker Compose. In this part, we will build a full-stack application using Next.js, PostgreSQL, and Minio S3.

## Introduction

In the early days of web development, files like images and documents were stored on the web server along with the application code. However, with increasing user traffic and the need to store large files, cloud storage services like Amazon S3 have become the preferred way to store files.

Separating the storage of files from the web server provides several benefits, including:

- Scalability and performance
- Large file support (up to 5TB)
- Cost efficiency
- Separation of concerns

In this article, we will build an example of a file storage application using Next.js, PostgreSQL, and Minio S3. There are two main ways to upload files to S3 from Next.js:

1. Using API routes to upload and download files.
   This is a simpler approach, but it has a limitation of 4MB, if you try to upload file more than 4MB, you will get a Next.js error ["API Routes Response Size Limited to 4MB" Error in Next.js"](https://nextjs.org/docs/messages/api-routes-response-size-limit).

1. Using presigned URLs to get temporary access to upload files and then upload files directly from frontend to S3.
   This approach is a little bit more complex, but it does not use resources on the Next.js server with file uploads.

## Source Code

You can find the full source code for this tutorial on [GitHub](https://github.com/aleksandr-efimenko/local-nextjs-postgres-s3)

## Upload and download files using Next.js API routes (4MB limit)

![Upload and files using Next.js API route](/blog-assets/file-storage-nextjs-postgres-s3/API-route-upload-diagram.png)

The diagram above shows the steps involved in uploading and downloading files using Next.js API routes.

To upload files:

1. User sends a POST request to the API route with the file to upload.
2. The API route uploads the file to S3 and returns the file name.
3. The file name is saved in the database.

To download files:

1. User sends a GET request to the API route to get data from the database about the file(s) to download.
2. The API route downloads the file from S3.
3. The file is returned to the user from the API route.

### 1. Frontend

To upload files, we will create a form with a file input field. First, we will create a `components` folder in the `src` folder. And create a `UploadFilesFormUI.tsx` file in the `components` folder. This file will contain the UI for the upload form which will be used in both approaches. Here is a simplified version of the file:

#### Upload form UI (the same for both approaches)

```tsx filename="src/components/UploadFilesForm/UploadFilesFormUI.tsx" copy
import Link from 'next/link'
import { LoadSpinner } from '../LoadSpinner'
import { type UploadFilesFormUIProps } from '~/utils/types'

export function UploadFilesFormUI({ isLoading, fileInputRef, uploadToServer, maxFileSize }: UploadFilesFormUIProps) {
  return (
    <form className='flex flex-col items-center justify-center gap-3' onSubmit={uploadToServer}>
      <h1 className='text-2xl'>File upload example using Next.js, MinIO S3, Prisma and PostgreSQL</h1>
      {isLoading ? (
        <LoadSpinner />
      ) : (
        <div className='flex h-16 gap-5'>
          <input
            id='file'
            type='file'
            multiple
            className='rounded-md border bg-gray-100 p-2 py-5'
            required
            ref={fileInputRef}
          />
          <button
            disabled={isLoading}
            className='m-2 rounded-md bg-blue-500 px-5 py-2 text-white
                hover:bg-blue-600  disabled:cursor-not-allowed disabled:bg-gray-400'
          >
            Upload
          </button>
        </div>
      )}
    </form>
  )
}
```

#### Upload form logic for API routes

Next, we will create a `UploadFilesRoute.tsx` file in the `components` folder. This file will contain the logic for the upload form which will be used in the API routes approach. Here is a simplified version, without validation, loading state and error handling:

```tsx filename="src/components/UploadFilesForm/UploadFilesRoute.tsx" copy
import { useState, useRef } from 'react'
import { validateFiles, createFormData } from '~/utils/fileUploadHelpers'
import { MAX_FILE_SIZE_NEXTJS_ROUTE } from '~/utils/fileUploadHelpers'
import { UploadFilesFormUI } from './UploadFilesFormUI'

type UploadFilesFormProps = {
  onUploadSuccess: () => void
}

export function UploadFilesRoute({ onUploadSuccess }: UploadFilesFormProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const uploadToServer = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const files = Object.values(fileInputRef.current?.files)

    const formData = createFormData(files)
    const response = await fetch('/api/files/upload/smallFiles', {
      method: 'POST',
      body: formData,
    })
    const body = (await response.json()) as {
      status: 'ok' | 'fail'
      message: string
    }
  }

  return (
    <UploadFilesFormUI
      isLoading={isLoading}
      fileInputRef={fileInputRef}
      uploadToServer={uploadToServer}
      maxFileSize={MAX_FILE_SIZE_NEXTJS_ROUTE}
    />
  )
}
```

Check the full code in the [GitHub repository](https://github.com/aleksandr-efimenko/local-nextjs-postgres-s3/blob/main/src/components/UploadFilesForm/UploadFilesRoute.tsx)

It's usually a good idea to extract the logic of the UI component into a separate file. One way is to create hooks for the logic and use the hooks in the UI component, however, for simplicity, we will create a separate file for the logic "fileUploadHelpers.ts" and use it in the "UploadFilesRoute" component.

```tsx filename="src/utils/fileUploadHelpers.ts" copy
export function createFormData(files: File[]): FormData {
  const formData = new FormData()
  files.forEach((file) => {
    formData.append('file', file)
  })
  return formData
}
```

### 2. Next.js API route to upload files

#### 2.1 Create utility functions to upload files to Minio S3

First, we will create utility functions to upload files to Minio S3. We will use the [minio](https://www.npmjs.com/package/minio) library to upload files. And axios to download files

```bash
npm install minio
```

Then create a `utils` folder in the `src` folder. And create a `s3-file-management.ts` file in the `utils` folder that contains the necessary utility functions for uploading and downloading files

#### 2.3 Create database models

To store files in the database, we will create a `File` model in the database.

```prisma
model File {
    id           String   @id @default(uuid())
    createdAt    DateTime @default(now())
    originalName String
    bucket       String
    fileName     String
    size         Int
    type         String
}
```

After creating the model, we need to apply the changes to the database. We can do this using `db push` or `db migrate` command, the difference between the two commands is that `db push` will drop the database and recreate it, while `db migrate` will only apply the changes to the database. More information about the commands can be found in [Prisma docs](https://www.prisma.io/docs/orm/prisma-migrate/workflows/prototyping-your-schema#choosing-db-push-or-prisma-migrate). In our case it doesn't matter which command we use, so we will use `db push` command.

Considering that we have are running the application in docker containers, we will need to run the `db push` command in the `web` container. To do this, we will use the `docker-compose exec` command.

```bash
docker-compose -f compose/docker-compose.yml exec -t web npx prisma db push

# or
docker-compose -f compose/docker-compose.yml exec -t web npx prisma migrate dev --name init
```

#### 2.3 Create an API route to upload files

Install Minio S3 client for Node.js.

```bash
npm install minio
```

### References and Further Reading

[Upload files with NextJS + Fetch + Api routes + Typescript](https://devpress.csdn.net/react/62eb6bd020df032da732b2ea.html)
[Minio Docs](https://docs.min.io/docs/javascript-client-api-reference.html)
