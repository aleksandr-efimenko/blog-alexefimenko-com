## Deploy locally using Docker Compose

It is the sixth part of the series where we are building a file storage application with Next.js, Prisma, and Minio. In this article, we will deploy the application locally using Docker Compose.

To deploy the application locally, we will use Docker Compose to run the Next.js app, PostgreSQL, and MinIO S3. I explained how to set up the Docker Compose file in the [previous article](https://blog.alexefimenko.com/posts/nextjs-postgres-s3-locally).

Here I want to mention some changes to the Docker Compose file we need to make because we need to use presigned URLs.

The key point is - when presigned url is created inside the docker container, it will have the same host as we set in the docker compose file. For example, if we have `environment: - S3_ENDPOINT=minio` in the docker compose file, the presigned url will have the host `minio`. All presigned urls will be like `http://minio:9000/bucket-name/file-name`.
These urls will not work on the client side (if we do not add minio to the hosts file). Here we cannot use localhost either, because localhost will be the host of the container, not the host of the client.

The solution is to use the `kubernetes.docker.internal` as the Minio S3 endpoint. This is a special DNS name that resolves to the host machine from inside a Docker container. It is available on Docker for Mac and Docker for Windows.

Also make sure that `kubernetes.docker.internal` is in the hosts file (it should be there by default). Then the presigned urls will be like `http://kubernetes.docker.internal:9000/bucket-name/file-name` and will work on the client side.

![Hosts file example](/blog-assets/file-storage-nextjs-postgres-s3/hosts-file-example.png)

Here is the full Docker Compose file:

```yaml filename="docker-compose.yml" copy
version: '3.9'
name: nextjs-postgres-s3minio
services:
  web:
    container_name: nextjs
    build:
      context: ../
      dockerfile: compose/web.Dockerfile
      args:
        NEXT_PUBLIC_CLIENTVAR: 'clientvar'
    ports:
      - 3000:3000
    volumes:
      - ../:/app
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/myapp-db?schema=public
      - S3_ENDPOINT=kubernetes.docker.internal
      - S3_PORT=9000
      - S3_ACCESS_KEY=minio
      - S3_SECRET_KEY=miniosecret
      - S3_BUCKET_NAME=s3bucket
    depends_on:
      - db
      - minio
    # Optional, if you want to apply db schema from prisma to postgres
    command: sh ./compose/db-push-and-start.sh
  db:
    image: postgres:15.3
    container_name: postgres
    ports:
      - 5432:5432
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: myapp-db
    volumes:
      - postgres-data:/var/lib/postgresql/data
    restart: unless-stopped
  minio:
    container_name: s3minio
    image: bitnami/minio:latest
    ports:
      - '9000:9000'
      - '9001:9001'
    volumes:
      - minio_storage:/data
volumes:
  postgres-data:
  minio_storage:
```

To run the application, use the following command:

```bash copy
docker-compose -f compose/docker-compose.yml --env-file .env up
```

After you run the application, you can access it at `http://localhost:3000`.
The Minio S3 will be available at `http://localhost:9000`. You can use the access key `minio` and the secret key `miniosecret` to log in.

You will see something like this:

![File storage app](/blog-assets/file-storage-nextjs-postgres-s3/app-screenshot.png)

The next step would be to deploy the application to a cloud provider. I will cover this in the next article.

You can check the live demo of the application [here](http://89.111.169.67). It is shared with the public, so all files are visible to everyone. You can upload, download, and delete any files. Please do not upload any sensitive information.

## Conclusion

In this article, we learned how to upload and download files using Next.js, PostgreSQL, and Minio S3. We also learned how to use presigned URLs to upload and download files directly from the client to S3. We created an application to upload, download, and delete files from S3 using presigned URLs. We also learned how to deploy the application locally using Docker Compose.

Hope you found this article helpful. If you have any questions or suggestions, feel free to leave a comment.

### References and Further Reading

- [Diagrams created with Excalidraw](https://excalidraw.com/#json=yxJaRLLQlSAwKPuK3va91,UJ-_cqop7_cUyPCs7foc_w)

- [Network configuration for localhost in Docker for Minio](https://blog.min.io/from-docker-to-localhost/)

- [Upload files with NextJS + Fetch + Api routes + Typescript](https://devpress.csdn.net/react/62eb6bd020df032da732b2ea.html)

- [Minio Docs](https://docs.min.io/docs/javascript-client-api-reference.html)

Brief Description for search engines: In this article, we will deploy the File storage application locally using Docker Compose. We will use Docker Compose to run the Next.js app, PostgreSQL, and MinIO S3.
