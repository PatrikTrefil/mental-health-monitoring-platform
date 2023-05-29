import {
    PHASE_DEVELOPMENT_SERVER,
    PHASE_PRODUCTION_SERVER,
} from "next/constants.js";
// https://nextjs.org/docs/advanced-features/security-headers

/* HACK: setting `worker-src blob:` is dangerous (formio should fix this,
   see issue https://github.com/formio/formio.js/issues/5146) */
const ProductionContentSecurityPolicy = `
    default-src 'self';
    script-src 'self' cdn.form.io;
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

export default async (phase) => {
    if (
        phase === PHASE_DEVELOPMENT_SERVER ||
        phase === PHASE_PRODUCTION_SERVER
    ) {
        const env = await import("./src/env.mjs");
        // check that all environment variables are set
        env.envVarSchema.parse(process.env);
    }

    return nextConfig;
};
