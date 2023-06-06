"use client";

import { ClientProvider as TrpcClientProvider } from "@/client/trpcClient";
import { SSRProvider } from "@/components/shared/client-react-bootstrap";
import { SessionProvider } from "next-auth/react";

// react query provider is in the trpc client provider

export function Providers({ children }: { children?: React.ReactNode }) {
    return (
        <TrpcClientProvider>
            <SSRProvider>
                <SessionProvider>{children}</SessionProvider>
            </SSRProvider>
        </TrpcClientProvider>
    );
}
