// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

import { themes } from "prism-react-renderer";

const lightCodeTheme = themes.github;
const darkCodeTheme = themes.dracula;

const webAppRoot = "../src/web-app/";

/** @type {import('@docusaurus/types').Config} */
const config = {
    plugins: [
        [
            "docusaurus-plugin-typedoc",
            {
                entryPoints: [`${webAppRoot}/src`],
                tsconfig: `${webAppRoot}/tsconfig.json`,
                entryPointStrategy: "expand",
                out: "Webová aplikace/Reference",
                watch: process.env.TYPEDOC_WATCH,
                sidebar: {
                    categoryLabel: "Reference",
                },
            },
        ],
    ],
    title: "Dokumentace - Mental health monitoring platform",
    tagline: "",
    favicon: "img/favicon.ico",

    // Set the production url of your site here
    url: "https://mental-health-monitoring-platform.vercel.app",
    // Set the /<baseUrl>/ pathname under which your site is served
    // For GitHub pages deployment, it is often '/<projectName>/'
    baseUrl: "/",

    // GitHub pages deployment config.
    // If you aren't using GitHub pages, you don't need these.
    organizationName: "PatrikTrefil", // Usually your GitHub org/user name.
    projectName: "mental-health-monitoring-platform", // Usually your repo name.

    onBrokenLinks: "throw",
    onBrokenMarkdownLinks: "throw",

    // Even if you don't use internalization, you can use this field to set useful
    // metadata like html lang. For example, if your site is Chinese, you may want
    // to replace "en" with "zh-Hans".
    i18n: {
        defaultLocale: "cs",
        locales: ["cs"],
    },
    markdown: {
        mermaid: true,
    },
    themes: ["@docusaurus/theme-mermaid"],

    presets: [
        [
            "classic",
            /** @type {import('@docusaurus/preset-classic').Options} */
            ({
                docs: {
                    sidebarPath: require.resolve("./sidebars.js"),
                    // Please change this to your repo.
                    // Remove this to remove the "edit this page" links.
                    editUrl:
                        "https://github.com/PatrikTrefil/mental-health-monitoring-platform/tree/main/docs",
                    routeBasePath: "/",
                    remarkPlugins: [
                        require("@akebifiky/remark-simple-plantuml"),
                    ],
                },
                theme: {
                    customCss: require.resolve("./src/css/custom.css"),
                },
            }),
        ],
    ],
    themeConfig:
        /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
        ({
            // Replace with your project's social card
            image: "img/docusaurus-social-card.jpg",
            navbar: {
                title: "Mental health monitoring platform",
                logo: {
                    alt: "My Site Logo",
                    src: "img/logo.svg",
                },
                items: [
                    {
                        type: "docSidebar",
                        sidebarId: "docsSidebar",
                        position: "left",
                        label: "Docs",
                    },
                    {
                        href: "https://github.com/PatrikTrefil/mental-health-monitoring-platform",
                        label: "GitHub",
                        position: "right",
                    },
                ],
            },
            footer: {
                style: "dark",
                links: [
                    {
                        title: "More",
                        items: [
                            {
                                label: "GitHub",
                                href: "https://github.com/PatrikTrefil/mental-health-monitoring-platform",
                            },
                        ],
                    },
                ],
                copyright: `Copyright © ${new Date().getFullYear()} Mental health monitoring platform, Patrik Trefil.`,
            },
            prism: {
                theme: lightCodeTheme,
                darkTheme: darkCodeTheme,
            },
        }),
};

module.exports = config;
