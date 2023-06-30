import {
    PHASE_DEVELOPMENT_SERVER,
    PHASE_EXPORT,
    PHASE_PRODUCTION_BUILD,
    PHASE_PRODUCTION_SERVER,
    PHASE_TEST,
} from "next/constants.js";
// https://nextjs.org/docs/advanced-features/security-headers

/* HACK: setting `worker-src blob:` is dangerous (formio should fix this,
   see issue https://github.com/formio/formio.js/issues/5146) */
// HACK: the script-src contains `unsafe-eval` because of formio Form component
// HACK: The `script-src` contains `unsafe-inline`. I could not
// find a way of implementing strict CSP with Next.js
// https://github.com/vercel/next.js/issues/23993
// https://github.com/vercel/next.js/discussions/51039
// https://github.com/Sprokets/nextjs-csp-report-only/issues/1
// HACK: `style-src` contains unsafe-inline. Can't get rid of it...
const ProductionContentSecurityPolicy = `
    default-src 'self';
    script-src 'self' cdn.form.io 'unsafe-inline' 'unsafe-eval';
    style-src 'self' 'unsafe-inline';
    img-src 'self' data:;
    worker-src blob:;
    `;
const DevContentSecurityPolicy = `
    default-src 'self';
    connect-src 'self' webpack://* ws://*;
	script-src 'self' 'unsafe-eval' 'unsafe-inline' cdn.form.io;
	style-src 'self' 'unsafe-inline';
    img-src 'self' data:;
    worker-src blob:;
    `;

const isDev = process.env.NODE_ENV !== "production";
const ContentSecurityPolicy = isDev
    ? DevContentSecurityPolicy
    : ProductionContentSecurityPolicy;

const securityHeaders = [
    {
        // allow prefetch of DNS data
        key: "X-DNS-Prefetch-Control",
        value: "on",
    },
    {
        key: "Strict-Transport-Security", // allow only HTTPS to access this website
        value: "max-age=63072000; includeSubDomains; preload", // max-age=2 years
    },
    {
        // stop loading when XSS attack is detected
        key: "X-XSS-Protection",
        value: "1; mode=block",
    },
    {
        // only the same origin can embed the website in an iframe
        key: "X-Frame-Options",
        value: "SAMEORIGIN",
    },
    {
        key: "X-Content-Type-Options",
        value: "nosniff",
    },
    {
        // don't leak the referrer when leaving the website
        // send referrer only on HTTPS
        key: "Referrer-Policy",
        value: "same-origin",
    },
    {
        key: "Content-Security-Policy",
        value: ContentSecurityPolicy.replace(/\s{2,}/g, " ").trim(), // replace newlines with spaces
    },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    output: "standalone",

    eslint: {
        dirs: ["src"],
    },
    // this makes hot reloading work when Dockerized
    webpack: (config) => {
        config.watchOptions = {
            poll: 1000,
            aggregateTimeout: 300,
        };
        return config;
    },
    redirects: async () => [
        {
            source: "/zamestnanec",
            destination: "/zamestnanec/prehled",
            permanent: true,
        },
    ],
    poweredByHeader: false,
    async headers() {
        return [
            {
                // Apply these headers to all routes in your application.
                source: "/:path*",
                headers: securityHeaders,
            },
        ];
    },
};

export default async function getNextConfig(phase) {
    const env = await import("./src/env.mjs");

    if (phase === PHASE_DEVELOPMENT_SERVER) {
        env.devEnvSchema.parse(process.env);
    } else if (phase === PHASE_PRODUCTION_SERVER) {
        env.productionServerEnvSchema.parse(process.env);
    } else if (phase === PHASE_PRODUCTION_BUILD) {
        env.productionBuildEnvSchema.parse(process.env);
    } else if (phase === PHASE_EXPORT) {
        throw new Error("This application is not meant to be exported");
    } else if (phase === PHASE_TEST) {
        env.testEnvSchema.parse(process.env);
    }

    return nextConfig;
}
