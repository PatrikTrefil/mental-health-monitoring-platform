/**
 * Schema of environment variables of the application
 *
 * This module is written in JS so it can be imported into next.config.mjs.
 * This module can also be imported into TS.
 * @module env
 */
import { z } from "zod";

export const envVarSchema = z.object({
    NEXT_PUBLIC_FORMIO_BASE_URL: z.string().url(),
    NEXTAUTH_URL: z.string().url(),
    NEXTAUTH_SECRET: z.string(),
    FORMIO_SERVER_URL: z.string().url(),
    FORMIO_ROOT_EMAIL: z.string().email(),
    FORMIO_ROOT_PASSWORD: z.string(),
    DATABASE_URL: z.string().url(),
    NEXT_PUBLIC_INTERNAL_NEXT_SERVER_URL: z.string().url(),
});
