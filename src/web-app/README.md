# Mental health monitoring platform web application

## Prerequisites

-   install dependencies using `npm install` or `yarn install`
-   configure the following environment variables in `.env` file (if you forget, the app will not start)
    -   `NEXT_PUBLIC_FORMIO_BASE_URL` - URL of the formio server
    -   `FORMIO_SERVER_URL` - URL of the Formio server

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
