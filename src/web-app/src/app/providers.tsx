"use client";

import { ClientProvider as TrpcClientProvider } from "@/client/trpcClient";
import { SSRProvider } from "@/components/shared/client-react-bootstrap";
import { SessionProvider } from "next-auth/react";
import { ToastContainer } from "react-toastify";

// react query provider is in the trpc client provider

export function Providers({ children }: { children?: React.ReactNode }) {
    return (
        <TrpcClientProvider>
            <SSRProvider>
                <SessionProvider>
                    {children}
                    {/* Provides toast container */}
                    <ToastContainer
                        pauseOnFocusLoss={false}
                        autoClose={false}
                        position="bottom-right"
                        theme="colored"
                    />
                </SessionProvider>
            </SSRProvider>
        </TrpcClientProvider>
    );
}
