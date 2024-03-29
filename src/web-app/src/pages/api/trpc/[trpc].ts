import { appRouter } from "@/server/routers/root";
import { createTRPCContext } from "@/server/trpc";
import { createNextApiHandler } from "@trpc/server/adapters/next";

// @see https://nextjs.org/docs/api-routes/introduction
export default createNextApiHandler({
    router: appRouter,
    createContext: createTRPCContext,
});
