import { prisma } from "@/server/db";
import { initTRPC, TRPCError } from "@trpc/server";
import { type CreateNextContextOptions } from "@trpc/server/adapters/next";
import { type Session } from "next-auth";
import superjson from "superjson";
import { getServerAuthSession } from "./auth";

/**
 * Options of {@link createInnerTRPCContext}.
 */
export type CreateContextOptions = {
    session: Session | null;
};

/**
 * This helper generates the "internals" for a tRPC context. If you need to use it, you can export
 * it from here.
 *
 * Examples of things you may need it for:
 * - testing, so we don't have to mock Next.js' req/res
 * - tRPC's `createSSGHelpers`, where we don't have req/res.
 * @param opts - Options for the context.
 * @returns The internals of a tRPC context object.
 * @see https://create.t3.gg/en/usage/trpc#-serverapitrpcts
 */
export const createInnerTRPCContext = (opts: CreateContextOptions) => {
    return {
        session: opts.session,
        prisma,
    };
};

/**
 * This is the actual context you will use in your router. It will be used to process every request
 * that goes through your tRPC endpoint.
 * @param opts - Options for the context.
 * @returns A tRPC context.
 * @see https://trpc.io/docs/context
 */
export const createTRPCContext = async (opts: CreateNextContextOptions) => {
    const { req, res } = opts;

    // Get the session from the server using the getServerSession wrapper function
    const session = await getServerAuthSession({ req, res });

    return createInnerTRPCContext({
        session,
    });
};

// Avoid exporting the entire t-object
// since it's not very descriptive.
// For instance, the use of a t variable
// is common in i18n libraries.
const t = initTRPC.context<typeof createTRPCContext>().create({
    transformer: superjson,
});

/**
 * This is how you create new routers and sub-routers in your tRPC API.
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;

/** Reusable middleware that enforces users are logged in before running the procedure. */
const enforceUserIsAuthed = t.middleware(({ ctx, next }) => {
    if (!ctx.session || !ctx.session.user)
        throw new TRPCError({ code: "UNAUTHORIZED" });

    return next({
        ctx: {
            // infers the `session` as non-nullable
            session: { ...ctx.session, user: ctx.session.user },
        },
    });
});

/**
 * Protected (authenticated) procedure.
 *
 * If you want a query or mutation to ONLY be accessible to logged in users, use this. It verifies
 * the session is valid and guarantees `ctx.session.user` is not null.
 * @see https://trpc.io/docs/procedures
 */
export const protectedProcedure = t.procedure.use(enforceUserIsAuthed);
