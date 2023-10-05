"use client";

import { ClientProvider as TrpcAndReactQueryClientProvider } from "@/client/trpcClient";
import { SSRProvider } from "@/components/client-react-bootstrap";
import { SessionProvider } from "next-auth/react";
import { ToastContainer } from "react-toastify";

// react query provider is in the trpc client provider

/**
 * All providers used in the app.
 * @param root0 - Props.
 * @param root0.children - Child components.
 */
export function Providers({ children }: { children?: React.ReactNode }) {
    return (
        <TrpcAndReactQueryClientProvider>
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
        </TrpcAndReactQueryClientProvider>
    );
}
