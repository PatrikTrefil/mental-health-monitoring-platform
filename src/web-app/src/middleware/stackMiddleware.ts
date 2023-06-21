import { NextMiddlewareWithAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { MiddlewareWrapper } from "./types";

/**
 * Chain multiple middleware functions into one.
 * @param functions functions to chain
 * @returns chained middleware function
 */
export function stackMiddlewares(
    functions: MiddlewareWrapper[] = []
): NextMiddlewareWithAuth {
    return stackMiddlewaresInternal(functions, 0);
}

function stackMiddlewaresInternal(
    functions: MiddlewareWrapper[] = [],
    index: number
): NextMiddlewareWithAuth {
    // recursively call all middlewares
    const current = functions[index];
    if (current) {
        const next = stackMiddlewaresInternal(functions, index + 1);
        return current(next);
    }
    return () => NextResponse.next();
}
