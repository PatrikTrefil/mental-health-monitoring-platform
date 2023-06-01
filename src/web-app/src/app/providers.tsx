"use client";

import { SSRProvider } from "@/components/shared/client-react-bootstrap";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";

const queryClient = new QueryClient();

export function Providers({ children }: { children?: React.ReactNode }) {
    return (
        <SSRProvider>
            <SessionProvider>
                <QueryClientProvider client={queryClient}>
                    {children}
                </QueryClientProvider>
            </SessionProvider>
        </SSRProvider>
    );
}
