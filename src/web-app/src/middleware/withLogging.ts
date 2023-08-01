import { MiddlewareWrapper } from "./types";

/**
 * Middleware for logging requests in format: "\{METHOD\} \{PATHNAME\}"
 */
const withLogging: MiddlewareWrapper = (middlewareToWrap) => {
    return async (request, _next) => {
        console.debug(request.method, request.nextUrl.pathname);
        return middlewareToWrap(request, _next);
    };
};

export default withLogging;
