import { stackMiddlewares as chainMiddlewares } from "./middleware/stackMiddleware";
import { MiddlewareWrapper } from "./middleware/types";
import withAuth from "./middleware/withAuth";
import withLogging from "./middleware/withLogging";

// To implement middleware chaining we are going to use decorators (higher order functions)
// https://reacthustle.com/blog/how-to-chain-multiple-middleware-functions-in-nextjs

const middlewares: MiddlewareWrapper[] = [withAuth, withLogging];

export default chainMiddlewares(middlewares);

export const config = {
    matcher: ["/uzivatel/:path*", "/zamestnanec/:path*", "/api/:path*"],
};
