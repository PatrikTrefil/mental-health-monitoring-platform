"use client";

import "bootstrap/dist/css/bootstrap.css";
import "formiojs/dist/formio.full.min.css";
import "react-toastify/dist/ReactToastify.min.css";

import "@/styles/globals.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import type { AppProps } from "next/app";
import Head from "next/head";
import { ToastContainer } from "react-toastify";

const queryClient = new QueryClient();

export default function App({
    Component,
    pageProps: { session, ...pageProps },
}: AppProps) {
    return (
        <>
            <Head>
                {/* The following line is necessary for bootstrap */}
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                />
            </Head>
            <SessionProvider session={session}>
                <QueryClientProvider client={queryClient}>
                    <Component {...pageProps} />
                </QueryClientProvider>
            </SessionProvider>
            <ToastContainer
                pauseOnFocusLoss={false}
                autoClose={false}
                position="bottom-right"
                theme="colored"
            />
        </>
    );
}
