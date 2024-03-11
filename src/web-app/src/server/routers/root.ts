import { createTRPCRouter } from "../trpc";
import draftRouter from "./draftRouter";
import formResultsRouter from "./formResultsRouter";
import taskRouter from "./taskRouter";

export const appRouter = createTRPCRouter({
    task: taskRouter,
    draft: draftRouter,
    formResults: formResultsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
