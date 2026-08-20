import { defineConfig } from 'vitepress'

export default defineConfig({
  lang: 'en-US',
  title: 'NetLens',
  titleTemplate: ':title | NetLens',
  description: 'Dockerized NfSen NetFlow Analyzer. Capture, store, visualize, and retain network flows.',
  cleanUrls: false,
  lastUpdated: true,
  themeConfig: {
    logo: '/netlens-icon.svg',
    siteTitle: 'NetLens',
    nav: [
      { text: 'Guide', link: '/guide/introduction' },
      { text: 'Integration', link: '/integration/librenms' },
      { text: 'Reference', link: '/reference/commands' },
      { text: 'GitHub', link: 'https://github.com/rezwanvaiya2-0/netlens' }
    ],
    sidebar: {
      '/guide/': [
        { text: 'Guide', items: [
          { text: 'Introduction', link: '/guide/introduction' },
          { text: 'Installation', link: '/guide/installation' },
          { text: 'Data Folders & Bind Mounts', link: '/guide/data-folders' },
          { text: 'Managing Router Sources', link: '/guide/router-sources' },
          { text: 'Adding a Router on a New Port', link: '/guide/new-port' },
          { text: 'Password Protection', link: '/guide/password-protection' },
          { text: 'Data Retention', link: '/guide/data-retention' },
          { text: 'Troubleshooting', link: '/guide/troubleshooting' }
        ] }
      ],
      '/integration/': [
        { text: 'Integration', items: [{ text: 'LibreNMS Integration', link: '/integration/librenms' }] }
      ],
      '/reference/': [
        { text: 'Reference', items: [
          { text: 'Security Notes', link: '/reference/security' },
          { text: 'Commands Cheatsheet', link: '/reference/commands' }
        ] }
      ]
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/rezwanvaiya2-0/netlens' }
    ],
    search: { provider: 'local' },
    outline: { level: [2, 3], label: 'On this page' },
    footer: {
      message: 'Built for practical network visibility.',
      copyright: 'NetLens is open source under the BSD-3-Clause license.'
    },
    editLink: {
      pattern: 'https://github.com/rezwanvaiya2-0/netlens/edit/gh-pages/site/docs/:path',
      text: 'Edit this page on GitHub'
    }
  },
  head: [
    ['link', { rel: 'icon', href: '/favicon.svg' }],
    ['meta', { property: 'og:image', content: 'https://netlens.rezwan.bro.bd/netlens-wordmark.svg' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { name: 'theme-color', content: '#0b1417' }]
  ]
})
