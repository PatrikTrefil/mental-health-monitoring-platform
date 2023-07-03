# Mental health monitoring platform web application

## Prerequisites

-   install dependencies using `npm install` or `yarn install`
-   configure the following environment variables in `.env` file (if you forget, the app will not start)
    -   `NEXT_PUBLIC_FORMIO_BASE_URL` - URL of the formio server
    -   `DATABASE_URL` - URL of the database
    -   `NEXT_PUBLIC_INTERNAL_NEXT_SERVER_URL` - URL for Formio server to call back to the web app
        -   It's public because it's used when defining
            webhooks in the client
    -   `FORMIO_SERVER_URL` - internal URL of the Formio server
    -   you can find an example in `.env.example` file

## Production build

```bash
npm run build
```

## Development mode

Run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Docker development mode

When installing new dependencies, it's necessary to rebuild the Docker image.

## Generate documentation

```bash
npm run docs
```

The generated documentation will be available in `docs` folder.

## Inspect database content

Run the following command:

```
npx prisma studio
```

If you want to inspect the database which runs in a Docker container,
you need to run this command in the container.

## Run tests

Setup the database by providing the necessary environment variables (see `/.env.test.example`)
and migrating using `npx prisma` if needed.

```
npm run test
```
