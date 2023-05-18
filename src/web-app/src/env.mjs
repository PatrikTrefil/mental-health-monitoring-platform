/**
 * Schema of environment variables of the application
 *
 * This module is written in JS so it can be imported into next.config.mjs.
 * This module can also be imported into TS.
 * @module env
 */
import { z } from "zod";

export const envVarSchema = z.object({
    NEXT_PUBLIC_FORMIO_BASE_URL: z.string(),
});
