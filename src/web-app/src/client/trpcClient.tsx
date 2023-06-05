"use client";

import type { AppRouter } from "@/server/routers/_app";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, loggerLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import { useState } from "react";
import superjson from "superjson";

function getBaseUrl() {
    if (typeof window !== "undefined")
        // browser should use relative path
        return "";
    if (process.env.VERCEL_URL)
        // reference for vercel.com
        return `https://${process.env.VERCEL_URL}`;
    if (process.env.RENDER_INTERNAL_HOSTNAME)
        // reference for render.com
        return `http://${process.env.RENDER_INTERNAL_HOSTNAME}:${process.env.PORT}`;
    // assume localhost
    return `http://localhost:${process.env.PORT ?? 3000}`;
}

// Currently not using the Next.js integration because Next.js 13 is not fully supported
// yet. We do not need the extra features it provides (it's built on the the react-query integration).
// In the future, it might be worth it to switch to the Next.js integration.

/**
 * tRPC client instance
 */
export const trpc = createTRPCReact<AppRouter>({
    unstable_overrides: {
        useMutation: {
            async onSuccess(opts) {
                await opts.originalFn();
                await opts.queryClient.invalidateQueries();
            },
        },
    },
});

/**
 * Wrap the whole app in this provider to use trpc
 */
export function ClientProvider(props: { children: React.ReactNode }) {
    // The reason for using useState in the creation of the queryClient
    // and the TRPCClient, as opposed to declaring them outside of the component,
    // is to ensure that each request gets a unique client when using SSR.
    // If you use client side rendering then you can move them if you wish.
    const [queryClient] = useState(() => new QueryClient());
    const [trpcClient] = useState(() =>
        trpc.createClient({
            links: [
                loggerLink({
                    enabled: () => true,
                }),
                httpBatchLink({
                    url: `${getBaseUrl()}/api/trpc`,
                }),
            ],
            transformer: superjson,
        })
    );
    return (
        <trpc.Provider client={trpcClient} queryClient={queryClient}>
            <QueryClientProvider client={queryClient}>
                {props.children}
            </QueryClientProvider>
        </trpc.Provider>
    );
}
