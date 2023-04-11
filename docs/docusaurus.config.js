// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Backpack Documentation',
  tagline: 'The home to Xnfts.',
  url: 'https://www.backpack.app',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'throw',
  favicon: 'docusaurus/img/favicon.ico',
  trailingSlash: false,

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          path: 'content',
          routeBasePath: '/',
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl:
            'https://www.backpack.app',
          showLastUpdateTime: true,
        },
        blog: false,
        googleTagManager: {
          containerId: process.env.GTAG_MANAGER_ID || "undefined",
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        logo: {
          alt: 'Backpack Logo',
          src: 'docusaurus/img/logo.svg',
          href: 'https://www.backpack.app'
        },
        items: [
          {
            to: 'https://www.backpack.app',
            position: 'right',
            className: 'navbar-github-link',
          },
        ],
      },
      footer: {
        links: [
          {
            title: 'Company',
            items: [
              {
                label: 'About',
                to: 'https://www.backpack.app',
              },
              {
                label: 'Case studies',
                to: 'https://www.backpack.app',
              },
              {
                label: 'White papers',
                to: 'https://www.backpack.app',
              },
              {
                label: 'Partners',
                to: 'https://www.backpack.app',
              },
              {
                label: 'Legal',
                to: 'https://www.backpack.app',
              },
              {
                label: 'Newsroom',
                to: 'https://www.backpack.app',
              },
              {
                label: 'Brand assets',
                to: 'https://www.backpack.app',
              },
              {
                label: 'Careers',
                to: 'https://www.backpack.app',
              },
            ],
          },
          {
            title: 'Products',
            items: [
              {
                label: 'Extension',
                to: 'https://www.backpack.app',
              },
            ],
          },
          {
            title: 'Solutions',
            items: [
              {
                label: 'Extension',
                to: 'https://www.backpack.app',
              },
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'Docs',
                to: 'https://www.backpack.app',
              },
              {
                label: 'Developers',
                to: 'https://www.backpack.app',
              },
              {
                label: 'Blog',
                to: 'https://www.backpack.app',
              },
              {
                label: 'Write for us',
                to: 'https://www.backpack.app',
              },
            ],
          },
          {
            title: 'Contact',
            items: [
              {
                label: 'Support',
                to: 'https://www.backpack.app',
              },
              {
                label: 'Sales',
                to: 'https://www.backpack.app',
              },
              {
                label: 'Status',
                to: 'https://www.backpack.app',
              },
            ],
          },
        ],
        copyright: `© Backpack ${new Date().getFullYear()}. All rights reserved.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
      docs: {
        sidebar: {
          hideable: true,
        },
      },
    }),
};

module.exports = config;
