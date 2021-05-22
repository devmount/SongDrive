module.exports = {
	base: '/SongDrive/',
	head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }]
  ],
	locales: {
    '/': {
      lang: 'en-EN',
      title: 'SongDrive',
      description: 'Store, manage, synchronize and present songs and setlists'
    },
    '/de/': {
      lang: 'de-DE',
      title: 'SongDrive',
      description: 'Speichern, Synchronisieren und Präsentieren von Liedern und Setlisten'
    }
  },
	themeConfig: {
		logo: '/logo.svg',
		displayAllHeaders: true,
		sidebar: 'auto',
		repo: 'devmount/SongDrive',
		docsDir: 'docs/src',
		editLinks: true,
		smoothScroll: true,
		locales: {
			'/': {
				selectText: 'Language',
				label: 'English',
				ariaLabel: 'Select Language',
				editLinkText: 'Edit this page on GitHub',
				nav: [
					{ text: 'Home', link: '/' },
					{ text: 'Guide', link: '/guide/' },
				],
				lastUpdated: 'Last Updated'
			},
			'/de/': {
				selectText: 'Sprache',
				label: 'Deutsch',
				ariaLabel: 'Sprache auswählen',
				editLinkText: 'Bearbeite diese Seite auf GitHub',
				nav: [
					{ text: 'Start', link: '/' },
					{ text: 'Guide', link: '/guide/' },
				],
				lastUpdated: 'Zuletzt aktualisiert'
			},
		}
	}
}
