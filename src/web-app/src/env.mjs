/**
 * Schema of environment variables of the application.
 *
 * This module is written in JS so it can be imported into next.config.mjs.
 * This module can also be imported into TS.
 * @module env
 */
import { z } from "zod";

/**
 * All environment variables are specified here. This schema is used in dev mode.
 */
export const allEnvVarsSchema = z.object({
    NEXT_PUBLIC_FORMIO_BASE_URL: z.string().url(),
    NEXTAUTH_URL: z.string().url(),
    NEXTAUTH_SECRET: z.string(),
    FORMIO_ROOT_EMAIL: z.string().email(),
    FORMIO_ROOT_PASSWORD: z.string(),
    FORMIO_SERVER_URL: z.string().url(),
    DATABASE_URL: z.string().url(),
    NEXT_PUBLIC_INTERNAL_NEXT_SERVER_URL: z.string().url(),
});

export { allEnvVarsSchema as devEnvSchema };

const publicEnvVarsPrefix = "NEXT_PUBLIC_";

/**
 * Include all keys which are prefixed with {@link publicEnvVarsPrefix},
 * because they will be inlined during build.
 */
const buildMask = Object.fromEntries(
    Object.keys(allEnvVarsSchema.shape)
        .filter((key) => key.startsWith(publicEnvVarsPrefix))
        .map((k) => [k, true])
);

/**
 * Environment variables needed during production build.
 */
export const productionBuildEnvSchema = allEnvVarsSchema.pick(buildMask);

/**
 * Environment variables needed for starting the production server.
 */
export const productionServerEnvSchema = allEnvVarsSchema.omit(buildMask);

// If you need to include more variables for new tests, add it the the mask
const testMask = {};

/**
 * Environment variables needed for testing.
 */
export const testEnvSchema = allEnvVarsSchema.pick(testMask);
