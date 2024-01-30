---
title: "Building a file storage with Next.js, PostgreSQL, and Minio S3"
excerpt: "In this article, we will build a full-stack application using Next.js, PostgreSQL, and Minio S3."
coverImage: "/blog/nextjs-postgres-s3-locally/cover.png"
date: "2024-06-01"
ogImage:
  url: "/blog/nextjs-postgres-s3-locally/cover.png"
---

## Building a file storage with Next.js, PostgreSQL, and Minio S3

### Introduction

In the early days of web development, files like images and documents were stored on the web server along with the application code. However, with increasing user traffic and the need to store large files, cloud storage services like Amazon S3 have become the preferred way to store files.

Separating the storage of files from the web server provides several benefits, including:

- Scalability and performance
- Large file support (up to 5TB)
- Cost efficiency
- Reliability
- Global availability

In this article, we will build an example of a file storage application using Next.js, PostgreSQL, and Minio S3. There are two main ways to upload files to S3 from Next.js:

1. Using API routes to upload and download files. 
This is a simpler approach, but it has a limitation of 4MB, if you try to upload file more than 4MB, you will get a Next.js error ["API Routes Response Size Limited to 4MB" Error in Next.js"](https://nextjs.org/docs/messages/api-routes-response-size-limit).

2. Using presigned URLs to get temporary access to upload files and then upload files directly from frontend to S3. 
This approach is a little bit more complex, but it does not use resources on the Next.js server with file uploads.


### 


### 1. Frontend - Update the Next.js page to upload files

First, we will update the Next.js page to upload files. We will use the [react-dropzone](https://react-dropzone.js.org/) library to upload files.

```bash
npm install react-dropzone
```

Next, we will update the `pages/index.js` file to upload files.

```tsx
import React, { useCallback, useState } from "react";
```

### 2. Backend

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

Next, we will create an API endpoint to upload files. We will use the [multer](https://www.npmjs.com/package/multer) library to upload files.

```

```

### References and Further Reading

[Upload files with NextJS + Fetch + Api routes + Typescript](https://devpress.csdn.net/react/62eb6bd020df032da732b2ea.html)
[Minio Docs](https://docs.min.io/docs/javascript-client-api-reference.html)
