"use client";

import "bootstrap/dist/css/bootstrap.css";
import "formiojs/dist/formio.full.min.css";

import "../styles/globals.css";
import type { AppProps } from "next/app";

import { Provider } from "react-redux";
import dynamic from "next/dynamic";
import AsyncAuthInit from "../components/AsyncAuthInit";
import Head from "next/head";

export default function App({ Component, pageProps }: AppProps) {
    // We can not use any sort of SSR, because the store depends on "@formio/react",
    // which is not available on the server (depends on the Browser API)
    const ProviderWithStoreLoaded = dynamic(
        async () => {
            const formiojs = await import("formiojs");

            if (!process.env.NEXT_PUBLIC_FORMIO_BASE_URL)
                throw new Error("NEXT_PUBLIC_FORMIO_BASE_URL is not set");

            console.debug(
                `Setting formio base url to ${process.env.NEXT_PUBLIC_FORMIO_BASE_URL} ...`
            );
            // the base url setting is necessary for the Redux store creation

            // The following runs in the browser, which is
            // necessary for the Formio.setBaseUrl to work.
            formiojs.Formio.setBaseUrl(process.env.NEXT_PUBLIC_FORMIO_BASE_URL);

            console.debug("Creating Redux store...");
            const storeModule = await import("../redux/store");
            const store = storeModule.default;

            // This arrow function (functional component) captures
            // the store variable and uses it to create the whole App
            const AppWithLoadedDependencies = () => {
                return (
                    <Provider store={store}>
                        <AsyncAuthInit />
                        <Component {...pageProps} />
                    </Provider>
                );
            };
            return AppWithLoadedDependencies;
        },
        {
            ssr: false,
            loading: () => <span>Načítání ...</span>,
        }
    );

    return (
        <>
            <Head>
                {/* The following line is necessary for bootstrap */}
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                />
            </Head>
            <ProviderWithStoreLoaded />
        </>
    );
}
