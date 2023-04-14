// https://nextjs.org/docs/advanced-features/security-headers

const ProductionContentSecurityPolicy = "default-src 'self';";
const DevContentSecurityPolicy = `
    default-src 'self';
    connect-src 'self' webpack://* ws://*;
	script-src 'self' 'unsafe-eval' 'unsafe-inline';
	style-src 'self' 'unsafe-inline';
    `;

const isDev = process.env.NODE_ENV !== 'production'
const ContentSecurityPolicy = isDev ? DevContentSecurityPolicy : ProductionContentSecurityPolicy;

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
        value: ContentSecurityPolicy.replace(/\s{2,}/g, ' ').trim() // replace newlines with spaces
    },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    output: "standalone",

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
            destination: "/zamestnanec/login",
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

module.exports = nextConfig;
