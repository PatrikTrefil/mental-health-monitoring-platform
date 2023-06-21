import { NextMiddlewareWithAuth } from "next-auth/middleware";

export type MiddlewareWrapper = (
    middleware: NextMiddlewareWithAuth
) => NextMiddlewareWithAuth;
