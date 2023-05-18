/**
 * This file is used to add types to the process.env object.
 * @module envTypes
 */
import { z } from "zod";
import { envVarSchema } from "../env.mjs";

declare global {
    namespace NodeJS {
        interface ProcessEnv extends Readonly<z.infer<typeof envVarSchema>> {}
    }
}
