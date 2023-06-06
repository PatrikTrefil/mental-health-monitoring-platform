# Mental health monitoring platform web application

## Prerequisites

-   install dependencies using `npm install` or `yarn install`
-   configure the following environment variables in `.env` file (if you forget, the app will not start)
    -   `NEXT_PUBLIC_FORMIO_BASE_URL` - URL of the formio server
    -   `FORMIO_SERVER_URL` - URL of the Formio server
    -   `DATABASE_URL` - URL of the database SQLite file (e.g. `file:./db.sqlite`)

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

Set the `DATABASE_URL` environment variable to the test database file path (e.g. `file:./test.db`)
and run the following command:

```
npm run test
```
