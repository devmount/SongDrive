// SongDrive version
var VERSION = '0.2.10'

// Default admin mode (if set to false, SongDrive will be in reading mode only)
var ADMIN = false

// Setup language
var LANGUAGE = 'de'

// Setup translations
const TRANSLATIONS = {
  en: {
    logo: 'Logo',
    songdrive: 'SongDrive',
    dashboard: 'Dashboard',
    song: 'Song | Songs',
    setlist: 'Setlist | Setlists',
    signin: 'Sign In',
    signout: 'Sign Out',
    profile: 'Profile',
    settings: 'Settings',
    with: 'with',
    by: 'by',
  },
  de: {
    logo: 'Logo',
    songdrive: 'SongDrive',
    dashboard: 'Dashboard',
    song: 'Lied | Lieder',
    setlist: 'Setlist | Setlisten',
    signin: 'Anmelden',
    signout: 'Abmelden',
    profile: 'Profil',
    settings: 'Einstellungen',
    with: 'mit',
    by: 'von',
  }
}

// Setup VueI18n instance with options
const I18N = new VueI18n({
  locale: LANGUAGE, // set locale
  messages: TRANSLATIONS, // set locale output
})

// Setup Firebase
firebase.initializeApp(config)
var songsRef    = firebase.database().ref('songs')
var setlistsRef = firebase.database().ref('setlists')
var usersRef    = firebase.database().ref('users')

// Setup Notyf
var notyf = new Notyf({
  delay: 4000,
  alertIcon: 'ti-alert ti-2x',
  confirmIcon: 'ti-check ti-2x'
})

// Setup Clipboard
var clipboard = new ClipboardJS('.clipboard');
clipboard.on('success', function(e) {
  e.clearSelection()
  notify('success', 'Copied!', 'Setlist was successfully copied to your clipboard.')
});
clipboard.on('error', function(e) {
  notify('error', 'Not Copied!', 'Sorry, you can\'t copy something to your clipboard.')
});

// Setup ChartJS
Chart.defaults.global.defaultFontFamily     = 'Fira Sans'
Chart.defaults.global.title.display         = true
Chart.defaults.global.title.fontSize        = 24
Chart.defaults.global.title.fontColor       = '#000'
Chart.defaults.global.title.fontStyle       = '300'
Chart.defaults.global.title.padding         = 15
Chart.defaults.global.legend.position       = 'bottom'
Chart.defaults.global.tooltips.cornerRadius = 0
Chart.defaults.global.tooltips.xPadding     = 10
Chart.defaults.global.tooltips.yPadding     = 10
Chart.defaults.global.maintainAspectRatio   = false

// Setup PDF export
pdfMake.fonts = {
  FiraSans: {
    normal: 'FiraSans-Light.ttf',
    bold: 'FiraSans-Bold.ttf',
    italics: 'FiraSans-Regular.ttf',
    bolditalics: 'FiraSans-Medium.ttf'
  },
  FiraMono: {
    normal: 'FiraMono-Regular.ttf',
    bold: 'FiraMono-Bold.ttf',
    italics: 'FiraMono-Medium.ttf'
  },
  Roboto: {
    normal: 'Roboto-Regular.ttf',
    bold: 'Roboto-Medium.ttf',
    italics: 'Roboto-Italic.ttf',
    bolditalics: 'Roboto-Italic.ttf'
  }
}

// Setup tuning
var TUNES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'B', 'H', 'C']

// external compontent: vue-multiselect
Vue.component('multiselect', VueMultiselect.Multiselect)

// external compontent: vue2-scrollbar
Vue.component('vuebar', Vuebar)

// external compontent: vue-tippy
Vue.component('tippy', VueTippy)

// external compontent: vswipe
Vue.component('vswipe', VSwipe)

// external compontent: vue-shortkey
Vue.use(VueHotkey)

// internal component: live clock
var Clock = {
  template: '#clock',
  data: function() {
    return {
      hours: '',
      minutes: '',
    }
  },
  mounted: function() {
    this.updateDateTime()
  },
  methods: {
    updateDateTime: function() {
      var now = new Date()
      this.hours = this.getZeroPad(now.getHours())
      this.minutes = this.getZeroPad(now.getMinutes())
      setTimeout(this.updateDateTime, 1000)
    },
    getZeroPad: function(n) {
      return (parseInt(n, 10) >= 10 ? '' : '0') + n
    }
  }
}

// global partial: app header
Vue.component('app-header', {
  template: '#app-header',
  data: function() {
    return {
      user: {},
      login: {
        email: '',
        password: ''
      }
    }
  },
  methods: {
    // admin sign in
    signIn: function() {
      var self = this
      firebase.auth().signInWithEmailAndPassword(this.login.email, this.login.password).then(function(){
        // sign-in successful
        ADMIN = true
        notify('success', 'Successfully signed in', 'You\'re now browsing SongDrive as admin.')
        self.$forceUpdate()
      }).catch(function(error) {
        // sign-in failed
        notify('error', 'You\'re login attempt failed', '<b>' + error.code + '</b>: ' + error.message)
      })
    },
    // admin sign out
    signOut: function() {
      var self = this
      firebase.auth().signOut().then(function() {
        // sign-out successful
        ADMIN = false
        notify('success', 'Successfully signed out', 'You\'re no admin anymore.')
        self.$forceUpdate()
      }).catch(function(error) {
        // an error happened.
        notify('error', 'You\'re logout attempt failed', '<b>' + error.code + '</b>: ' + error.message)
      })
    },
    // set user object
    setUser: function(user) {
      this.user = user
    }
  },
  mounted: function() {
    // check initially if authenticated user exists
    var self = this
    firebase.auth().onAuthStateChanged(function(user) {
      ADMIN = user ? true : false
      self.setUser(user)
    }.bind(this))
  }
})

// global partial: app footer
Vue.component('app-footer', {
  template: '#app-footer'
})

// partial: song form fields
Vue.component('song-form-fields', {
  template: '#song-form-fields',
  props: {
    song: this.song,
    songs: this.songs,
    searchKey: this.searchKey
  },
  data: function() {
    return {
      languages: getLanguages(),
      tags: getTags().sort()
    }
  },
  computed: {
    // apply filter
    filteredSongs: function() {
      return filterSongs(this.songs, this.searchKey)
    }
  },
  methods: {
    addTag: function(newTag) {
      this.tags.push(newTag)
      this.song.tags.push(newTag)
    }
  }
})

// partial: setlist form fields
Vue.component('setlist-form-fields', {
  template: '#setlist-form-fields',
  props: {
    setlist: this.setlist,
    songs: this.songs,
    searchKey: this.searchKey
  },
  methods: {
    // remove song manually
    removeSong: function(key) {
      for (var i = 0; i < this.setlist.songs.length; i++) {
        var song = this.setlist.songs[i]
        // find song to remove in all setlist songs
        if (song == key) {
          // remove song key from setlist songs list
          this.setlist.songs.splice(this.setlist.songs.indexOf(song), 1)
        }
      }
    },
    updateOrder: function(e) {
      var clonedItems = this.setlist.songs.filter(function(item){ return item })
      clonedItems.splice(e.newIndex, 0, clonedItems.splice(e.oldIndex, 1)[0])
      // update setlist objects's songs with new order
      this.setlist.songs = clonedItems
    }
  },
  computed: {
    // apply filter
    filteredSongs: function() {
      return filterSongs(this.songs, this.searchKey)
    }
  },
  mounted: function() {
    flatpickr('.flatpickr', {
      wrap: true,
      clickOpens: true,
      allowInput: true,
      locale: {
        firstDayOfWeek: 1 // start week on Monday
      }
    })
  }
})

// component: dashboard
var Dashboard = Vue.extend({
  template: '#dashboard',
  firebase: {
    songs: songsRef,
    setlists: setlistsRef.orderByChild('date')
  },
  data: function() {
    return {
      tags: getTags(),
      randomSongs: null,
      isRandom: false,
    }
  },
  methods: {
    // shuffle song list
    shuffleSongs: function() {
      if (this.randomSongs === null) {
        // first show latest songs
        this.randomSongs = getFirstProperties(this.songs.reverse(), 6)
      } else {
        // invoke randomization of songs list
        this.isRandom = true
        this.randomSongs = getRandomProperties(this.songs, 6)
      }
    }
  },
  mounted: function() {
    // get snapshot of song list
    var self = this
    songsRef.on('value', function(snap) {
      // initially shuffle songs
      self.shuffleSongs()
      var songs = snap.val()
      // a doughnut chart for song languages
      var data = [], labels = [], colors = []
      var languages = getLanguages()
      // for each existing languages count number of songs in that language
      for (var l in languages) {
        var n = 0
        for (var id in songs) {
          if (songs[id].language == languages[l].key) {
            n++
          }
        }
        // add data to arrays
        data.push(n)
        labels.push(languages[l].label)
        colors.push('hsl(84, ' + (65 - 6*parseInt(l)) + '%, ' + (70 - 12*parseInt(l)) + '%)')
      }
      // create doughnut chart with data arrays
      new Chart('languages', {
        type: 'doughnut',
        data: {
          labels: labels,
          datasets: [{
            data: data,
            backgroundColor: colors,
            hoverBackgroundColor: colors
          }]
        },
        options: {
          title: {
            text: 'LANGUAGES'
          }
        }
      })
      // a doughnut chart for song tags
      data = getTopTags(songs, 10)
      var labels = [], counts = [], colors = []
      for (var i in data) {
        labels.push(data[i].label)
        counts.push(data[i].count)
        colors.push('hsl(84, ' + (65 - 3*parseInt(i)) + '%, ' + (80 - 6*parseInt(i)) + '%)')
      }
      // create doughnut chart with data arrays
      new Chart('tags', {
        type: 'doughnut',
        data: {
          labels: labels,
          datasets: [{
            data: counts,
            backgroundColor: colors,
            hoverBackgroundColor: colors
          }]
        },
        options: {
          title: {
            text: 'TAG USAGE'
          }
        }
      })
    })
    // get snapshot of setlist list
    setlistsRef.on('value', function(snap) {
      // a bar chart for number of setlists per year
      var setlists = snap.val()
      var setlistNumber = {}, songNumber = {}
      for (var setlist in setlists) {
        if (setlists[setlist].date.length > 0) {
          var year = setlists[setlist].date.substr(0, 4)
          if (!setlistNumber[year] || parseInt(setlistNumber[year]) < 1) {
            setlistNumber[year] = 0
            songNumber[year] = 0
          }
          setlistNumber[year]++
          if (setlists[setlist].songs) {
            songNumber[year] += setlists[setlist].songs.length
          }
        }
      }
      // create bar chart with setlist number arrays
      if (document.getElementById('setlists-per-year')) {
        new Chart('setlists-per-year', {
          type: 'bar',
          data: {
            labels: Object.keys(setlistNumber),
            datasets: [{
              data: Object.keys(setlistNumber).map(function(key) { return setlistNumber[key] }),
              backgroundColor: '#88b544',
              borderColor: '#fff',
              borderWidth: 2,
            }]
          },
          options: {
            legend: false,
            scales: {
              yAxes: [{
                ticks: {
                  beginAtZero: true
                }
              }]
            },
            title: {
              text: 'SETLISTS PERFORMED'
            }
          }
        })
      }
      // create bar chart with song number arrays
      if (document.getElementById('songs-per-year')) {
        new Chart('songs-per-year', {
          type: 'bar',
          data: {
            labels: Object.keys(songNumber),
            datasets: [{
              data: Object.keys(songNumber).map(function(key ) { return songNumber[key] }),
              backgroundColor: '#88b544',
              borderColor: '#fff',
              borderWidth: 2,
            }]
          },
          options: {
            legend: false,
            scales: {
              yAxes: [{
                ticks: {
                  beginAtZero: true
                }
              }]
            },
            title: {
              text: 'SONGS PERFORMED'
            }
          }
        })
      }
    })
  }
})

// component: show user profile
var ShowProfile = Vue.extend({
  template: '#show-profile',
  data: function() {
    return {
      user: firebase.auth().currentUser
    }
  }
})

// component: edit user settings
var Settings = Vue.extend({
  template: '#settings',
  data: function() {
    var user = firebase.auth().currentUser
    return {
      user: user,
      userData: {
        displayName: user ? user.displayName : '',
        photoURL: user ? user.photoURL : ''
      }
    }
  },
  methods: {
    updateSettings: function() {
      // update settings data
      this.user.updateProfile(this.userData).then(function() {
        // user profile updated successfully
        notify('success', 'Settings updated', 'Data was successfully saved.')
        router.push({ name: 'profile' })
      }, function(error) {
        // an error happened
        notify('error', 'Settings not updated', 'Sorry, an error occured.')
        router.push({ name: 'settings' })
      });
    }
  }
})

// component: song list
var ListSongs = Vue.extend({
  template: '#song-list',
  firebase: {
    songs: songsRef.orderByChild('title')
  },
  data: function() {
    // get existing tags and add universal tag to reset tag filter if tag is set
    var tags = getTags().sort()
    if (this.$route.params.tag) {
      tags.unshift('All')
    }
    return {
      searchKey: '',
      tags: tags,
      tag: this.$route.params.tag,
      tuning: this.$route.params.tuning,
    }
  },
  methods: {
    loadTag: function() {
      if (this.tag == 'All') {
        router.push({ name: 'songs' })
      } else {
        router.push({ name: 'songs-by-tag', params: { tag: this.tag }})
      }
    },
    resetSearch: function() {
      this.searchKey = ''
    }
  },
  computed: {
    // apply filter
    filteredSongs: function() {
      return filterSongs(this.songs, this.searchKey)
    },
    // add hotkeys
    keymap: function() {
      return {
        // reset search
        esc: this.resetSearch,
      }
    }
  },
  mounted: function() {
    // set initial focus to search input
    document.getElementById('search').focus()
    // load initial tag filter if set
    if (this.$route.params.tag) {
      this.songs = songsByTag(this.songs, this.$route.params.tag)
    }
    // load initial tuning filter if set
    if (this.$route.params.tuning) {
      this.songs = songsByTuning(this.songs, this.$route.params.tuning)
    }
  }
})

// component: show song
var ShowSong = Vue.extend({
  template: '#show-song',
  firebase: {
    songs: songsRef
  },
  data: function() {
    // get song from firebase and bind it to this.song
    this.$bindAsObject('song', songsRef.child(this.$route.params.song_id))
    return {
      song: this.song,
      songs: this.songs,
      textOnly: false,
      tuning: 0
    }
  },
  methods: {
    exportPdf: function() {
      var doc = getPdfSongsObject(this.song, null)
      pdfMake.createPdf(doc).open()
      notify('success', 'PDF export', 'Song was successfully exported as PDF.')
    },
    exportSng: function() {
      var content =
        '#LangCount=1' + '\n' +
        '#Title=' + this.song.title + '\n' +
        '#Author=' + this.song.authors + '\n' +
        '#Melody=' + this.song.authors + '\n' +
        '#(c)=' + this.song.year + ' ' + this.song.publisher.replace(/(?:\r\n|\r|\n)/g, '; ') + '\n' +
        '#Key=' + this.song.tuning + '\n' +
        '#CCLI=' + this.song.ccli + '\n' +
        '---' + '\n'
      parseSongContent(this.song.content).forEach(function(part) {
        switch (part.type) {
          case 'v':
            content += 'verse'; break
          case 'p':
            content += 'pre-chorus'; break
          case 'c':
            content += 'chorus'; break
          case 'b':
            content += 'bridge'; break
          case 'i':
            content += 'intro'; break
          case 'm':
            content += 'mitro'; break
          case 'o':
            content += 'outro'; break
          default: break
        }
        content += part.number > 0 ? ' ' + part.number : ''
        content += '\n' + removeChords(part.content) + '\n--\n'
      }, this)
      download(content, this.song.title + '.sng')
      notify('success', 'SNG export', 'Song was successfully exported as SNG.')
    },
    toggleChords: function() {
      // toggle textOnly
      this.textOnly = !this.textOnly
      // show text without chord lines
      if (this.textOnly) {
        // set song content to content without chords
        this.song.content = removeChords(this.song.content)
      }
      // show text + chords (default)
      else {
        // get original song content
        this.$bindAsObject('song', songsRef.child(this.$route.params.song_id))
      }
    },
    transposeChords: function(mode) {
      // set song content to content transposed chords
      if (mode == 0) {
        // reset tuning: get original song content
        this.tuning = 0
        this.$bindAsObject('song', songsRef.child(this.$route.params.song_id))
      } else {
        // adapt tuning and update song content
        this.tuning += mode
        this.song.content = transposeChords(mode, this.song.content)
        // update song tuning while iterating through the TUNES array
        var tuningIndex = TUNES.indexOf(this.song.tuning) + mode
        // when reaching a negative index, start from the end of the array again
        if (tuningIndex < 0) {
          tuningIndex = TUNES.length - 2
        }
        this.song.tuning = TUNES[tuningIndex]
      }
    }
  },
  computed: {
    // add hotkeys
    keymap: function() {
      return {
        // go back
        esc: function() { router.go(-1) },
        // toggle chords
        c: this.toggleChords
      }
    }
  }
})

// component: export song as copyable text
var TxtSong = Vue.extend({
  template: '#txt-song',
  firebase: {
    songs: songsRef
  },
  data: function() {
    // get song from firebase and bind it to this.song
    this.$bindAsObject('song', songsRef.child(this.$route.params.song_id))
    return {
      song: this.song,
      songs: this.songs,
      textOnly: false,
      tuning: 0
    }
  },
  methods: {
    toggleChords: function() {
      // update toggle button
      this.textOnly = !this.textOnly
      // show text without chord lines
      if (this.textOnly) {
        // set song content to content without chords
        this.song.content = removeChords(this.song.content)
      }
      // show text + chords (default)
      else {
        // get original song content
        this.$bindAsObject('song', songsRef.child(this.$route.params.song_id))
      }
    },
    transposeChords: function(mode) {
      // set song content to content transposed chords
      if (mode == 0) {
        // reset tuning: get original song content
        this.tuning = 0
        this.$bindAsObject('song', songsRef.child(this.$route.params.song_id))
      } else {
        // adapt tuning and update song content
        this.tuning += mode
        this.song.content = transposeChords(mode, this.song.content)
        // update song tuning while iterating through the TUNES array
        var tuningIndex = TUNES.indexOf(this.song.tuning) + mode
        // when reaching a negative index, start from the end of the array again
        if (tuningIndex < 0) {
          tuningIndex = TUNES.length - 2
        }
        this.song.tuning = TUNES[tuningIndex]
      }
    }
  },
  computed: {
    // add hotkeys
    keymap: function() {
      return {
        // go back
        esc: function() { router.go(-1) },
        // toggle chords
        c: this.toggleChords,
      }
    }
  }
})

// component: present song in fullscreen
var PresentSong = Vue.extend({
  template: '#present-song',
  data: function() {
    // get song from firebase and bind it to this.song
    this.$bindAsObject('song', songsRef.child(this.$route.params.song_id))
    // check if tuning is set and transpose song content accordingly
    var tuning = this.$route.params.tuning
    if (tuning && tuning > 0) {
      for (var i = 0; i < tuning; i++) {
        this.song.content = transposeChords(1, this.song.content)
      }
    }
    else if (tuning && tuning < 0) {
      for (var i = 0; i < tuning*(-1); i++) {
        this.song.content = transposeChords(-1, this.song.content)
      }
    }
    return {
      song: this.song,
      textOnly: false
    }
  },
  methods: {
    // split song.content into two parts of most equal length without splitting song parts
    getTwoColumns: function(content) {
      var parts = content.split('\n\n')
      if (parts.length > 1) {
        var half_length = Math.floor(parts.length / 2)
        var leftSide = parts.splice(0, half_length)
        return [
          leftSide.join('\n\n'),
          parts.join('\n\n'),
        ]
      } else {
        return [content]
      }
    },
    toggleChords: function() {
      // update toggle button
      this.textOnly = !this.textOnly
      // show text only
      if (this.textOnly) {
        // set song content to content without chords
        this.song.content = removeChords(this.song.content)
        // show text as large as possible
        maximizeFontsize('.fullscreen')
      }
      // show text + chords (default)
      else {
        // get original song content
        this.$bindAsObject('song', songsRef.child(this.$route.params.song_id))
        // get original font size
        resetFontsize('.fullscreen')
      }
    }
  },
  computed: {
    // add hotkeys
    keymap: function() {
      return {
        // go back
        esc: function() { router.go(-1) },
        // toggle chords
        c: this.toggleChords,
      }
    }
  }
})

// component: add song
var AddSong = Vue.extend({
  template: '#add-song',
  firebase: {
    songs: songsRef.orderByChild('title')
  },
  data: function() {
    var song = {}, isCloned = false
    // check if an existing song should be used as template: song id exists
    if (this.$route.params.song_id) {
      // get existing song content
      this.$bindAsObject('clone', songsRef.child(this.$route.params.song_id))
      song = getSongObject(this.clone, !this.clone.hasOwnProperty('translations'))
      isCloned = true
    } else {
      // get empty song object
      song = getSongObject(null, true)
    }
    return {
      song: song,
      isCloned: isCloned,
      searchKey: ''
    }
  },
  methods: {
    createSong: function() {
      // only store language keys, not the whole language object
      this.song.language = this.song.language.key
      // store new song
      var newSong = songsRef.push(this.song)
      // update all songs that are a translation with back link
      if (this.song.translations && this.song.translations.length > 0) {
        this.song.translations.forEach(function(id) {
          // get translated song
          this.$bindAsObject('tsong', songsRef.child(id))
          // set 'translations' property if not exists
          if (!this.tsong.hasOwnProperty('translations')) {
            this.tsong.translations = []
          }
          // get proper song object
          this.tsong = getSongObject(this.tsong, false)
          // add this.song to translations of translated song
          this.tsong.translations.push(newSong.key)
          songsRef.child(id).set(this.tsong)
        }, this)
      }
      notify('success', 'Song added', 'Data was successfully saved.')
      router.push({ name: 'show-song', params: { song_id: newSong.key }})
    }
  },
  computed: {
    // add hotkeys
    keymap: function() {
      return {
        // create song
        'ctrl+enter': this.createSong,
      }
    }
  }
})

// component: edit song
var EditSong = Vue.extend({
  template: '#edit-song',
  firebase: {
    songs: songsRef.orderByChild('title')
  },
  data: function() {
    // get song from firebase and bind it to this.song
    this.$bindAsObject('song', songsRef.child(this.$route.params.song_id))
    if (!('translations' in this.song)) {
      this.song = getSongObject(this.song, true)
    }
    // get language object from key to use in multiselect element
    this.song.language = getLanguageByKey(this.song.language)
    return {
      song: this.song,
      searchKey: ''
    }
  },
  methods: {
    updateSong: function() {
      // only store language keys, not the whole language object
      this.song.language = this.song.language.key
      // update song data
      songsRef.child(this.$route.params.song_id).update(getSongObject(this.song, false))
      // update all songs that are a translation with back link
      if (this.song.translations && this.song.translations.length > 0) {
        this.song.translations.forEach(function(id) {
          // get translated song
          this.$bindAsObject('tsong', songsRef.child(id))
          // set 'translations' property if not exists
          if (!this.tsong.hasOwnProperty('translations')) {
            this.tsong.translations = []
          }
          // get proper song object
          this.tsong = getSongObject(this.tsong, false)
          // add this.song to translations of translated song, if it not already exists
          if (this.tsong.translations.indexOf(this.song['.key']) == -1) {
            this.tsong.translations.push(this.song['.key'])
          }
          songsRef.child(id).set(this.tsong)
        }, this)
      }
      notify('success', 'Song updated', 'Data was successfully saved.')
      router.push({ name: 'show-song', params: { song_id: this.$route.params.song_id }})
    }
  },
  computed: {
    // add hotkeys
    keymap: function() {
      return {
        // update song
        'ctrl+enter': this.updateSong,
      }
    }
  }
})

// component: delete song
var DeleteSong = Vue.extend({
  template: '#delete-song',
  data: function() {
    // get song from firebase and bind it to this.song
    this.$bindAsObject('song', songsRef.child(this.$route.params.song_id))
    return {
      song: this.song
    }
  },
  methods: {
    removeSong: function() {
      songsRef.child(this.$route.params.song_id).remove()
      notify('success', 'Song deleted', 'Data was successfully deleted.')
      router.push({ name: 'songs' })
    }
  },
  computed: {
    // add hotkeys
    keymap: function() {
      return {
        // cancel and go back
        esc: function() { router.go(-1) },
        // remove song
        'ctrl+enter': this.removeSong,
      }
    }
  }
})

// component: setlist list
var ListSetlists = Vue.extend({
  template: '#setlist-list',
  firebase: {
    setlists: setlistsRef.orderByChild('date')
  },
  data: function() {
    return {
      searchKey: ''
    }
  },
  methods: {
    resetSearch: function() {
      this.searchKey = ''
    }
  },
  computed: {
    // apply filter
    filteredSetlists: function() {
      var self = this
      return self.setlists.filter(function(setlist) {
        // filter fields: date, title
        var key = self.searchKey.toLowerCase()
        return setlist.date.toLowerCase().indexOf(key) !== -1 || setlist.title.toLowerCase().indexOf(key) !== -1
      })
    },
    // add hotkeys
    keymap: function() {
      return {
        // reset search
        esc: this.resetSearch,
      }
    }
  },
  mounted: function() {
    // set initial focus to search input
    document.getElementById('search').focus()
  }
})

// component: show setlist
var ShowSetlist = Vue.extend({
  template: '#show-setlist',
  firebase: {
    songs: songsRef,
    users: usersRef
  },
  data: function() {
    // get setlist from firebase and bind it to this.setlist
    this.$bindAsObject('setlist', setlistsRef.child(this.$route.params.setlist_id))
    if (!('songs' in this.setlist)) {
      this.setlist.songs = []
    }
    return {
      setlist: this.setlist,
      user: {}
    }
  },
  methods: {
    exportSetlist: function() {
      var doc = getPdfSetlistObject(this.setlist, this.songs)
      pdfMake.createPdf(doc).open()
      notify('success', 'PDF export', 'Setlist was successfully exported as PDF.')
    },
    exportSongsheets: function() {
      var doc = getPdfSongsObject(this.songs, this.setlist)
      pdfMake.createPdf(doc).open()
      notify('success', 'PDF export', 'Songsheets were successfully exported as PDF.')
    },
    updateOrder: function(e) {
      var clonedItems = this.setlist.songs.filter(function(item){
        return item
      })
      clonedItems.splice(e.newIndex, 0, clonedItems.splice(e.oldIndex, 1)[0])
      // update setlist's songs with new order
      setlistsRef.child(this.$route.params.setlist_id).update({songs: clonedItems})
      notify('success', 'Setlist saved', 'Sorting was successfully saved.')
    },
    activation: function(active) {
      // update setlist's active flag
      setlistsRef.child(this.$route.params.setlist_id).update({active: active})
      if (active) {
        notify('success', 'Setlist saved', 'Setlist was successfully activated.')
      } else {
        notify('success', 'Setlist saved', 'Setlist was successfully deactivated.')
      }
    },
    getAuthor: function() {
      // update user when all necessary data is loaded
      var self = this
      if (this.setlist.creator) {
        usersRef.child(this.setlist.creator).on('value', function(authorsSnap) {
          self.user = authorsSnap.val()
        })
      }
    }
  },
  mounted: function() {
    // get author
    this.getAuthor()
    // statistics
    if (document.getElementById('setlist-languages')) {
      setlistsRef.child(this.$route.params.setlist_id).on('value', function(setlistSnap) {
        songsRef.on('value', function(songSnap) {
          // a doughnut chart for setlist languages
          var setlist = setlistSnap.val()
          var songs = songSnap.val()
          var data = [], labels = [], colors = []
          var languages = getLanguages()
          if (setlist.songs) {
            // for each existing languages count number of setlist songs in that language
            for (var l in languages) {
              var n = 0
              for (var i in setlist.songs) {
                for (var j in songs) {
                  if (j == setlist.songs[i] && songs[j].language == languages[l].key) {
                    n++
                  }
                }
              }
              // add data to arrays
              if (n > 0) {
                data.push(n)
                labels.push(languages[l].label)
                colors.push('hsl(84, ' + (65 - 6*parseInt(l)) + '%, ' + (70 - 12*parseInt(l)) + '%)')
              }
            }
            // create doughnut chart with data arrays
            new Chart('setlist-languages', {
              type: 'doughnut',
              data: {
                labels: labels,
                datasets: [{
                  data: data,
                  backgroundColor: colors,
                  hoverBackgroundColor: colors
                }]
              },
              options: {
                animation: {
                  animateRotate: false
                },
                title: {
                  text: 'LANGUAGES'
                }
              }
            })
          }
          // a bar chart for setlist tags
          var data = [], labels = [], colors = [], tags = {}, sortedTags = []
          if (setlist.songs) {
            for (var i in setlist.songs) {
              for (var j in songs) {
                if (j == setlist.songs[i] && songs[j].tags) {
                  // count each tag of each song of the setlist
                  for (var k in songs[j].tags) {
                    if (tags[songs[j].tags[k]] > 0) {
                      tags[songs[j].tags[k]]++
                    } else {
                      tags[songs[j].tags[k]] = 1
                    }
                  }
                }
              }
            }
          }
          // sort tags by count
          for (var name in tags) {
            sortedTags.push([name, tags[name]]);
          }
          sortedTags.sort(function(a, b) { return b[1] - a[1]; });
          // get first 10 tags
          sortedTags = sortedTags.splice(0, 10)
          for (i in sortedTags) {
            data.push(sortedTags[i][1])
            labels.push(sortedTags[i][0])
            colors.push('hsl(84, ' + (65 - 2*parseInt(i)) + '%, ' + (70 - 4*parseInt(i)) + '%)')
          }
          // create bar chart with data arrays
          new Chart('setlist-tags', {
            type: 'horizontalBar',
            data: {
              labels: labels,
              datasets: [{
                data: data,
                backgroundColor: colors,
                hoverBackgroundColor: colors
              }]
            },
            options: {
              legend: {
                display: false
              },
              title: {
                text: 'TAGS'
              },
              scales: {
                xAxes: [{
                    ticks: {
                        beginAtZero: true,
                        stepSize: 1
                    }
                }]
              }
            }
          })
        })
      })
    }
  },
  computed: {
    // add hotkeys
    keymap: function() {
      return {
        // go back
        esc: function() { router.go(-1) },
      }
    }
  }
})

// component: export setlist songsheets as copyable text
var TxtSheets = Vue.extend({
  template: '#txt-sheets',
  firebase: {
    setlists: setlistsRef,
    songs: songsRef
  },
  data: function() {
    // get setlist from firebase and bind it to this.setlist
    this.$bindAsObject('setlist', setlistsRef.child(this.$route.params.setlist_id))
    return {
      setlist: this.setlist,
    }
  },
  methods: {
    toggleChords: function(song) {
      // set song content to content without chords
      song.content = removeChords(song.content)
    }
  },
  computed: {
    // add hotkeys
    keymap: function() {
      return {
        // go back
        esc: function() { router.go(-1) },
      }
    }
  }
})

// component: export setlist as copyable list
var TxtList = Vue.extend({
  template: '#txt-list',
  firebase: {
    setlists: setlistsRef,
    songs: songsRef
  },
  data: function() {
    // get setlist from firebase and bind it to this.setlist
    this.$bindAsObject('setlist', setlistsRef.child(this.$route.params.setlist_id))
    return {
      setlist: this.setlist
    }
  },
  computed: {
    // add hotkeys
    keymap: function() {
      return {
        // go back
        esc: function() { router.go(-1) },
      }
    }
  }
})

// component: add setlist
var AddSetlist = Vue.extend({
  template: '#add-setlist',
  firebase: {
    songs: songsRef.orderByChild('title')
  },
  data: function() {
    var setlist = {}, isCloned = false
    // check if an existing setlist should be used as template: setlist id exists
    if (this.$route.params.setlist_id) {
      // get existing setlist content
      this.$bindAsObject('clone', setlistsRef.child(this.$route.params.setlist_id))
      setlist = getSetlistObject(this.clone, !this.clone.hasOwnProperty('songs'))
      setlist.date = getCurrentDate()
      isCloned = true
    } else {
      // get empty setlist object
      setlist = getSetlistObject(null, true)
    }
    return {
      setlist: setlist,
      isCloned: isCloned,
      searchKey: '',
      user: firebase.auth().currentUser
    }
  },
  methods: {
    createSetlist: function() {
      // add creator
      this.setlist.creator = this.user.uid;
      var newSetlist = setlistsRef.push(this.setlist)
      notify('success', 'Setlist added', 'Data was successfully saved.')
      router.push({ name: 'show-setlist', params: { setlist_id: newSetlist.key }})
    }
  },
  computed: {
    // add hotkeys
    keymap: function() {
      return {
        // create song
        'ctrl+enter': this.createSetlist,
      }
    }
  }
})

// component: edit setlist
var EditSetlist = Vue.extend({
  template: '#edit-setlist',
  firebase: {
    songs: songsRef.orderByChild('title')
  },
  data: function() {
    // get setlist from firebase and bind it to this.setlist
    this.$bindAsObject('setlist', setlistsRef.child(this.$route.params.setlist_id))
    if (!('songs' in this.setlist)) {
      this.setlist = getSetlistObject(this.setlist, true)
    }
    return {
      setlist: this.setlist,
      searchKey: ''
    }
  },
  methods: {
    updateSetlist: function() {
      setlistsRef.child(this.$route.params.setlist_id).update(getSetlistObject(this.setlist, false))
      notify('success', 'Setlist updated', 'Data was successfully saved.')
      router.push({ name: 'show-setlist', params: { setlist_id: this.$route.params.setlist_id }})
    }
  },
  computed: {
    // add hotkeys
    keymap: function() {
      return {
        // update setlist
        'ctrl+enter': this.updateSetlist,
      }
    }
  }
})

// component: delete setlist
var DeleteSetlist = Vue.extend({
  template: '#delete-setlist',
  data: function() {
    // get setlist from firebase and bind it to this.setlist
    this.$bindAsObject('setlist', setlistsRef.child(this.$route.params.setlist_id))
    return {
      setlist: this.setlist
    }
  },
  methods: {
    removeSetlist: function() {
      setlistsRef.child(this.$route.params.setlist_id).remove()
      notify('success', 'Setlist deleted', 'Data was successfully deleted.')
      router.push({ name: 'setlists' })
    }
  },
  computed: {
    // add hotkeys
    keymap: function() {
      return {
        // cancel and go back
        esc: function() { router.go(-1) },
        // remove setlist
        'ctrl+enter': this.removeSetlist,
      }
    }
  }
})

// component: present setlist
var PresentSetlist = Vue.extend({
  template: '#present-setlist',
  components: {
    Clock: Clock,
  },
  firebase: {
    songs: songsRef
  },
  data: function() {
    // get setlist from firebase and bind it to this.setlist
    this.$bindAsObject('setlist', setlistsRef.child(this.$route.params.setlist_id))
    if (!('songs' in this.setlist)) {
      this.setlist.songs = []
    }
    return {
      setlist: this.setlist,
      textOnly: false,
      showClock: true,
      hide: false,
      joined: false,
      position: 0,
      swipeOptions: {
        startSlide: 0,
        speed: 300,
        auto: 0,
        continuous: true,
        disableScroll: false,
        stopPropagation: false,
        callback: this.updatePosition,
      }
    }
  },
  methods: {
    // navigation buttons
    prev: function() {
      this.$refs.presentationSwipe.prev()
    },
    next: function() {
      this.$refs.presentationSwipe.next()
    },
    slide: function(index, duration) {
      this.$refs.presentationSwipe.slide(index, duration)
    },
    updatePosition: function() {
      this.position = this.$refs.presentationSwipe.getPos()
      // update synced position if active, TODO: role ADMIN?
      if (this.setlist.active && ADMIN) {
        setlistsRef.child(this.$route.params.setlist_id).update({ position: this.position })
      }
    },
    // split song.content into two parts of most equal length without splitting song parts
    getTwoColumns: function(content) {
      var parts = content.split('\n\n')
      if (parts.length > 1) {
        var half_length = Math.floor(parts.length / 2)
        var leftSide = parts.splice(0, half_length)
        return [
          leftSide.join('\n\n'),
          parts.join('\n\n'),
        ]
      } else {
        return [content]
      }
    },
    toggleChords: function() {
      // toggle textOnly
      this.textOnly = !this.textOnly
      // show text only
      if (this.textOnly) {
        // for each song in setlist song list set song content to content without chords
        this.songs.forEach(function(song) {
          if (this.setlist.songs.indexOf(song['.key']) >= 0) {
            song.content = removeChords(song.content)
            // show text as large as possible
            maximizeFontsize('.presentation .' + song['.key'])
          }
        }, this)
      }
      // show text + chords (default)
      else {
        // get original setlist song content
        this.$bindAsArray('songs', songsRef)
        // get original font size
        resetFontsize('.presentation')
      }
    },
    toggleClock: function() {
      this.showClock = !this.showClock
    },
    toggleHide: function() {
      this.hide = !this.hide
    }
  },
  computed: {
    // add hotkeys for presentation navigation
    keymap: function() {
      return {
        // presentation navigation
        right: this.next,
        down: this.next,
        left: this.prev,
        up: this.prev,
        // toggle clock
        c: this.toggleClock,
        // toggle entire screen fade to black
        b: this.toggleHide,
        // go back
        esc: function() { router.go(-1) },
      }
    }
  },
  watch: {
    'setlist.position': function() {
      if (this.joined) {
        this.slide(this.setlist.position, 300)
      }
    },
    joined: function() {
      if (this.joined) {
        this.slide(this.setlist.position, 300)
      }
    }
  }
})

// router
var router = new VueRouter({
  routes: [
    // dashboard
    {name: 'home',            component: Dashboard,      path: '/'},
    // user
    {name: 'profile',         component: ShowProfile,    path: '/profile'},
    {name: 'settings',        component: Settings,       path: '/settings'},
    // songs
    {name: 'songs',           component: ListSongs,      path: '/songs'},
    {name: 'songs-by-tag',    component: ListSongs,      path: '/songs/tag/:tag'},
    {name: 'songs-by-tuning', component: ListSongs,      path: '/songs/tuning/:tuning'},
    {name: 'show-song',       component: ShowSong,       path: '/song/:song_id'},
    {name: 'txt-song',        component: TxtSong,        path: '/song/:song_id/txt'},
    {name: 'present-song',    component: PresentSong,    path: '/song/:song_id/fullscreen'},
    {name: 'add-song',        component: AddSong,        path: '/song/add'},
    {name: 'clone-song',      component: AddSong,        path: '/song/:song_id/clone'},
    {name: 'edit-song',       component: EditSong,       path: '/song/:song_id/edit'},
    {name: 'delete-song',     component: DeleteSong,     path: '/song/:song_id/delete'},
    // setlists
    {name: 'setlists',        component: ListSetlists,   path: '/setlists'},
    {name: 'show-setlist',    component: ShowSetlist,    path: '/setlist/:setlist_id'},
    {name: 'txt-sheets',      component: TxtSheets,      path: '/setlist/:setlist_id/txt-sheets'},
    {name: 'txt-list',        component: TxtList,        path: '/setlist/:setlist_id/txt-list'},
    {name: 'add-setlist',     component: AddSetlist,     path: '/setlist/add'},
    {name: 'clone-setlist',   component: AddSetlist,     path: '/setlist/:setlist_id/clone'},
    {name: 'edit-setlist',    component: EditSetlist,    path: '/setlist/:setlist_id/edit'},
    {name: 'delete-setlist',  component: DeleteSetlist,  path: '/setlist/:setlist_id/delete'},
    {name: 'present-setlist', component: PresentSetlist, path: '/setlist/:setlist_id/presentation'},
  ]
})

// create Vue app
var app = new Vue({
  el: '#app',
  router: router,
  i18n: I18N
})


/* --- Additional functions --- */

// create a single or multipage page pdf for a song or <setlist> (song sheets)
function getPdfSongsObject(songs, setlist) {
  var content = []
  // create multiple songsheets in one PDF
  if (setlist) {
    for (var j = 0; j < setlist.songs.length; j++) {
      for (var i = 0; i < songs.length; i++) {
        if (songs[i]['.key'] == setlist.songs[j]) {
          var song = songs[i]
          // add song content
          content = content.concat(getPdfSongContent(song))
          // add page break after every song exept for the last
          if (j < setlist.songs.length-1) {
            content.push({ text: '', pageBreak: 'after' })
          }
        }
      }
    }
  }
  // create only one songsheet (songs contains only a single song)
  else {
    var song = songs
    content = content.concat(getPdfSongContent(song))
  }
  // return page configuration with computed content
  return {
    pageSize: 'A4',
    pageMargins: [ 50, 50, 40, 30 ],
    content: content,
    styles: {
      header: {
        font: 'FiraSans',
        fontSize: 22
      },
      partnumber: {
        font: 'FiraSans',
        fontSize: 24,
        margin: [ 0, 17, 0, 0 ]
      },
      code: {
        font: 'FiraMono',
        fontSize: 10.5,
        margin: [ 0, 15, 0, 0 ]
      },
      copyright: {
        font: 'FiraSans',
        fontSize: 8,
        margin: [ 0, 20, 0, 0 ]
      }
    }
  }
}

// return an array of the <song> configuration for pdfmake
function getPdfSongContent(song) {
  // handle song content parts
  var content = [], parts = parseSongContent(song.content)
  parts.forEach(function(part) {
    if (part.type == 'v' && part.number != '0') {
      content.push({
      columnGap: 8,
      columns: [
      {
        style: 'partnumber',
        width: 'auto',
        text: part.number
      },
      {
            style: 'code',
        width: '*',
            // song content with respect to leading whitespaces
        text: '\u200B' + part.content.replace(/\n/g, "\n" + '\u200B')
      }
      ]
      })
    } else {
      content.push({
        style: 'code',
        // song content with respect to leading whitespaces
        text: '\u200B' + part.content.replace(/\n/g, "\n" + '\u200B')
      })
    }
  }, this)
  // return array with song data
  return [
    // song title [tuning] with a line beneath
    { text: song.title.toUpperCase() + (song.tuning ? '  [' + song.tuning + ']' : ''), style: 'header' },
    { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 505, y2: 0, lineWidth: .5 }] },
    content,
    // imprint with ccli#, author names and (c) year publisher
    {
      style: 'copyright',
      text: [
        song.ccli ? 'CCLI Song Nr.: ' + song.ccli + '\n' : '',
        song.authors ? song.authors + '\n' : '',
        '\u00A9 ' + song.year + ' ' + song.publisher
      ]
    }
  ]
}

// create a single page pdf for a <setlist>
function getPdfSetlistObject(setlist, songs) {
  // get all titles from songs of setlist
  var titles = []
  for (var j = 0; j < setlist.songs.length; j++) {
    for (var i = 0; i < songs.length; i++) {
      if (songs[i]['.key'] == setlist.songs[j]) {
        titles.push((j+1) + '.  \u2012  ' + songs[i]['title'] + '  [' + songs[i]['tuning'] + ']')
      }
    }
  }
  // return page configuration with setlist content
  return {
    pageSize: 'A4',
    pageMargins: [ 60, 50, 40, 60 ],
    content: [
      { text: setlist.date + '  ' + setlist.title.toUpperCase(), style: 'header' },
      { canvas: [
        {
          type: 'line',
          x1: 0, y1: 0,
          x2: 480, y2: 0,
          lineWidth: .5
        }
      ]},
      { text: ' ' },
      { text: ' ' },
      { text: titles.join("\n"), style: 'standard' }
    ],
    styles: {
      header: {
        font: 'FiraSans',
        fontSize: 22
      },
      standard: {
        font: 'FiraSans',
        fontSize: 14
      }
    }
  }
}

// download data to a file
// http://stackoverflow.com/questions/13405129/javascript-create-and-save-file
function download(data, filename) {
  var a = document.createElement('a'),
    file = new Blob([data], { type:'text/plain;charset=UTF-8' })
  if (window.navigator.msSaveOrOpenBlob) // IE10+
    window.navigator.msSaveOrOpenBlob(file, filename)
  else { // Others
    var url = URL.createObjectURL(file)
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    setTimeout(function() {
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    }, 0)
  }
}

// return a proper song object with only the properties to store/read from firebase
function getSongObject(song, noTranslations) {
  // if song is given, return proper song object with existing properties
  // else return empty property
  return {
    title:        song ? song.title : '',
    subtitle:     song ? song.subtitle : '',
    authors:      song ? song.authors : '',
    year:         song ? song.year : '',
    ccli:         song ? song.ccli : '',
    tuning:       song ? song.tuning : '',
    publisher:    song ? song.publisher : '',
    content:      song ? song.content : '',
    language:     song ? song.language : '',
    note:         song ? song.note : '',
    tags:         song ? song.tags : '',
    translations: song ? (noTranslations ? [] : song.translations) : []
  }
}

// return a proper setlist object with only the properties to store/read from firebase
function getSetlistObject(setlist, noSongs) {
  // if setlist is given, return setlist with existing properties
  // else return empty property
  return {
    date:     setlist ? setlist.date : '',
    title:    setlist ? setlist.title : '',
    songs:    setlist ? (noSongs ? [] : setlist.songs) : [],
    active:   setlist ? setlist.active : 0,
    position: setlist ? setlist.position : 0,
    creator:  setlist ? setlist.creator : ''
  }
}

// return all existing languages
function getLanguages() {
  return [
    { key:'de', label:'German'  },
    { key:'en', label:'English' },
    { key:'fr', label:'French'  },
    { key:'ln', label:'Lingala' },
  ]
}

// return language object given a <key>
function getLanguageByKey(key) {
  var result = getLanguages().filter( function(o){return o.key == key} )
  return result ? result[0] : null
}

// return all existing tags
function getTags() {
  return [
    'Praise',
    'Love',
    'Worship',
    'Jesus',
    'Adoration',
    'Declaration',
    'Salvation',
    'Christmas',
    'Prayer',
    'Faith',
    'Trust',
    'Grace',
    'Presence',
    'Joy',
    'Hope',
    'Children',
    'Glory',
    'Sacrifice',
    'Faithfulness',
    'Peace',
    'Strength',
    'Surrender',
    'Thankfulness',
    'Assurance',
    'Comfort',
    'Power',
    'Greatness',
    'Forgiveness',
    'Petition',
    'Blessing',
    'Guidance',
    'Victory',
    'Commitment',
    'Holy Spirit',
    'Cross',
    'Kingship',
    'Freedom',
    'Light',
    'Holiness',
    'Desire',
    'Evangelism',
    'Healing',
    'Life',
    'Easter',
    'Creation',
    'Encouragement',
    'Resurrection',
    'Father',
    'Longing',
    'Truth',
    'Unity',
    'Communion',
    'Obedience',
    'Humility',
    'Beauty',
    'Rest',
    'Revival',
    'Celebration',
  ]
}

// check if a string <line> represents a chord line, based on the convention of two spaces at line end
function isChordLine(line) {
  if (line == '') {
    return false
  }
  return line.slice(-2) === '  ';
}

// filter <songs> list by <searchkey>
function filterSongs(songs, searchKey) {
  return songs.filter(function(song) {
    // filter fields: title, subtitle
    var key = searchKey.toLowerCase()
    return song.title.toLowerCase().indexOf(key) !== -1 || song.subtitle.toLowerCase().indexOf(key) !== -1
  })
}

// filter <songs> list by <tag>
function songsByTag(songs, tag) {
  return songs.filter(function(song) {
    // filter field: tags
    var tags = []
    for (var i = 0; i < song.tags.length; i++) {
      tags.push(song.tags[i].toLowerCase())
    }
    return tags.indexOf(tag.toLowerCase()) !== -1
  })
}

// filter <songs> list by <tuning>
function songsByTuning(songs, tuning) {
  return songs.filter(function(song) {
    // filter field: tuning
    return song.tuning.toLowerCase() == tuning.toLowerCase()
  })
}

// remove chord lines from given multiline <str>ing
function removeChords(str) {
  var lines = str.split('\n')
  var newLines = []
  lines.forEach(function(line) {
    // identify chord lines
    if (!isChordLine(line)) {
      // only add text lines to new content
      newLines.push(line)
    }
  }, this)
  return newLines.join('\n')
}

// transpose chords <action> (up or down) of given multiline <str>ing
function transposeChords(action, str) {
  var lines = str.split('\n'), newLines = []
  for (var key in lines) {
    // get single line
    var line = lines[key]
    // init the new line to build and the current over- or underflow of spaces due to different chord string lenghts
    var newLine = '', spaces = 0
    // identify chord lines
    if (isChordLine(line)) {
      var i = 0
      while (i < line.length) {
        // get single character in line
        var c = line[i]
        // handle over- or underflow of spaces
        if (spaces > 0 && c == ' ') {
          // to few spaces: double next existing space and decrease space count
          c = '  '
          spaces--
        }
        if (spaces < 0 && c == ' ' && line[i+1] == ' ') {
          // to many spaces: skip one of two consecutive spaces and increase space count
          spaces++
          i++
          continue
        }
        // on '#': skip to next character as it will be handled together with tune
        if (c == '#') {
          i++
          continue
        }
        var isHalf = line[i+1] == '#'
        // check if character is a tune with '#'
        if (isHalf) {
          c = c + '#'
        }
        // check if character is a transposable character
        if (TUNES.indexOf(c) > -1) {
          // transpose chords up
          if (action == 1) {
            // replace character by next tune character
            var nextTune = TUNES[TUNES.indexOf(c) + 1]
            newLine += nextTune
            // update over- or underflow of spaces
            spaces += c.length - nextTune.length
          } else
          // transpose chords down
          if (action == -1) {
            // replace character by next tune character
            var prevTune = TUNES[TUNES.lastIndexOf(c) - 1]
            newLine += prevTune
            // update over- or underflow of spaces
            spaces += c.length - prevTune.length
          }
        } else {
          newLine += c
        }
        i++
      }
      // make sure that last two characters are spaces for chord line identification
      if (newLine.slice(-1) !== ' ') {
        newLine = newLine + ' '
      }
      if (newLine.slice(-2) !== '  ') {
        newLine = newLine + ' '
      }
    }
    // if no chord line: leave line as is
    else {
      newLine = line
    }
    // add lines to new content
    newLines.push(newLine)
  }
  return newLines.join('\n')
}

// display notification message <type> with <title> and <text>
function notify(type, title, text) {
  if (type == 'success') {
    notyf.confirm('<strong>' + title + '</strong><br />' + text)
  }
  if (type == 'error') {
    notyf.alert('<strong>' + title + '</strong><br />' + text)
  }
}

// parse txt song <content>
function parseTxtSongContent(content) {
  // initialize arrays for parsed lines
  var parsed = []
  var lines = content.split('\n')
  // check every content line
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i]
    // if normal song line is found
    if (line.trim().indexOf('--') < 0) {
      // add line
      parsed.push(line)
    }
    // if song part is found (e.g. --V1)
    else {
      // if song part is 'verse', prepend number to next text line
      if ((line.charAt(2) == 'v' || line.charAt(2) == 'V') && !isNaN(parseInt(line.trim().charAt(3)))) {
        // if next line is chord line, prepend number to the line after
        if (isChordLine(lines[i+1])) {
          lines[i+2] = line.trim().charAt(3) + '. ' + lines[i+2]
          // add 3 spaces to next line to sync chords with text again
          lines[i+1] = '   ' + lines[i+1]
        } else {
          lines[i+1] = line.trim().charAt(3) + '. ' + lines[i+1]
        }
      }
    }
  }
  return parsed.join('\n')
}

// parse song <content>
function parseSongContent(content) {
  // initialize arrays for parsed linex, classes of parts, type abbr., numbers of type and part index
  var parsed = [], classes = [], types = [], numbers = [], part = 0
  var lines = content.split('\n')
  // check every content line
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i]
    // if normal song line is found
    if (line.trim().indexOf('--') < 0) {
      // only consider line if not empty
      if (line.trim() != '') {
        if (!parsed[part]) {
          parsed[part] = []
        }
        // add line to current part
        parsed[part].push(line)
      }
    }
    // if song part is found (e.g. --V1)
    else {
      // add class to part
      switch (line.charAt(2)) {
        case 'V':
        case 'v':
          types.push('v')
          classes.push('verse ' + ((!isNaN(parseInt(line.trim().charAt(3)))) ? 'part' + line.trim().charAt(3) : ''))
          numbers.push((!isNaN(parseInt(line.trim().charAt(3)))) ? line.trim().charAt(3) : '0'); break
        case 'P':
        case 'p':
          types.push('p')
          classes.push('prechorus')
          numbers.push((!isNaN(parseInt(line.trim().charAt(3)))) ? line.trim().charAt(3) : '0'); break
        case 'C':
        case 'c':
          types.push('c')
          classes.push('chorus')
          numbers.push((!isNaN(parseInt(line.trim().charAt(3)))) ? line.trim().charAt(3) : '0'); break
        case 'B':
        case 'b':
          types.push('b')
          classes.push('bridge')
          numbers.push((!isNaN(parseInt(line.trim().charAt(3)))) ? line.trim().charAt(3) : '0'); break
        case 'I':
        case 'i':
          types.push('i')
          classes.push('intro')
          numbers.push((!isNaN(parseInt(line.trim().charAt(3)))) ? line.trim().charAt(3) : '0'); break
        case 'M':
        case 'm':
          types.push('m')
          classes.push('mitro')
          numbers.push((!isNaN(parseInt(line.trim().charAt(3)))) ? line.trim().charAt(3) : '0'); break
        case 'O':
        case 'o':
          types.push('o')
          classes.push('outro')
          numbers.push((!isNaN(parseInt(line.trim().charAt(3)))) ? line.trim().charAt(3) : '0'); break
        default:
          console.log('Ooops, something went wrong on parsing this line: "' + line + '"')
      }
      // consider next part
      part++
    }
  }
  var newContent = []
  // if multiple parts: rejoin lines of every part
  if (parsed.length > 1) {
    for (var i = 1; i < parsed.length; i++) {
      newContent.push({
        type: types[i-1],
        number: numbers[i-1],
        class: classes[i-1],
        content: parsed[i].join('\n')
      })
    }
  }
  // if no parts (no markers set): take whole content as one unclassified part
  else {
    newContent.push({
      type: '',
      number: 0,
      class: '',
      content: content
    })
  }
  return newContent
}

// get <n> different random properties from given <obj>ect
function getRandomProperties(obj, n) {
  if (obj) {
    // get object keys
    var keys = Object.keys(obj), elements = []
    for (var i = 0; i < n; i++) {
      // add a property of random key in obj
      var key = keys.length * Math.random() << 0
      elements.push(obj[keys[key]])
      // delete that key for avoiding duplicates
      keys.splice(key, 1)
    }
    return elements
  } else {
    return obj
  }
}

// get <n> first properties from given <obj>ect
function getFirstProperties(obj, n) {
  if (obj) {
    // get object keys
    var keys = Object.keys(obj), elements = []
    for (var i = 0; i < n; i++) {
      // add a property of random key in obj
      var key = keys[i]
      elements.push(obj[keys[key]])
    }
    return elements
  } else {
    return obj
  }
}

// get <n> different ids of popular songs from given <setlists> objects
function getPopularSongs(setlists, n) {
  var ids = {}
  setlists.forEach(function(setlist, i) {
    if (setlist.songs) {
      setlist.songs.forEach(function(id) {
        if (!ids.hasOwnProperty(id)) {
          ids[id] = 0
        } else {
          ids[id]++
        }
      })
    }
  })
  var sorted_ids = []
  for (var id in ids) {
    sorted_ids.push([id, ids[id]])
  }
  sorted_ids.sort(function(a, b) {
    return b[1] - a[1]
  })
  sorted_ids.splice(n)
  return sorted_ids
}

// get <n> most used tags from given <songs> object
function getTopTags(songs, n) {
  var data = []
  var tags = getTags()
  // for each existing tag count number of songs with that tag
  for (var t in tags) {
    var c = 0
    for (var id in songs) {
      if (songs[id].tags.indexOf(tags[t]) !== -1) {
        c++
      }
    }
    // add data to array
    data.push({count: c, label: tags[t]})
  }
  // sort data by count in descending order
  data.sort(function(a, b) {
    return b.count - a.count
  })
  if (data.length > n) {
    data = data.slice(0, n)
  }
  return data
}

// get current date in yyyy-mm-dd format
// @see http://stackoverflow.com/questions/1531093/how-do-i-get-the-current-date-in-javascript
function getCurrentDate() {
  // get current date object
  var today = new Date()
  var dd = today.getDate().toString()
  var mm = (today.getMonth() + 1).toString() //January is 0!
  var yyyy = today.getFullYear()
  // add preceding zeros
  if (parseInt(dd) < 10) {
    dd = '0' + dd
  }
  if (parseInt(mm) < 10) {
    mm = '0' + mm
  }
  // return formatted date
  return (yyyy + '-' + mm + '-' + dd)
};

// function to fit children b into their parent <selector> by adjusting the childrens font size
function maximizeFontsize(selector) {
  // all parent elements
  for (a of document.querySelectorAll(selector + ' .columns')) {
    // all child elements
    for (b of a.querySelectorAll('pre')) {
      b.style.display = 'inline-block'
      b.style.fontFamily = 'Fira Sans'
      var fontSize = getComputedStyle(b)['fontSize'].match(/\d+/)[0]
      // increase font size as long as the child is still smaller than the parent
      while (getComputedStyle(b)['width'].match(/\d+/)[0] < getComputedStyle(a)['width'].match(/\d+/)[0]*.9) {
        b.style.fontSize = (fontSize++) + 'px'
      }
      // decrease font size if the child width exceeds the parents width
      while (getComputedStyle(b)['width'].match(/\d+/)[0] > getComputedStyle(a)['width'].match(/\d+/)[0]*.9) {
        b.style.fontSize = (fontSize--) + 'px'
      }
    }
  }  
  // decrease font size of parts with greatest font size first if it doesnt fit into viewport height
  var vh = Math.max(document.documentElement.clientHeight, window.innerHeight || 0)*1.2
  for (r of document.querySelectorAll(selector + ' .content-row')) {
    // as long as the content row is higher than the viewport
    while (getComputedStyle(r)['height'].match(/\d+/)[0] > vh) {
      for (a of document.querySelectorAll(selector + ' .columns')) {
        // decrease font size of parts with greatest font size
        var parts = []
        for (b of a.querySelectorAll('pre')) {
          parts.push({ part: b, size: parseInt(getComputedStyle(b)['fontSize'].match(/\d+/)[0])})
        }
        parts.sort(function(a, b) { return b.size - a.size; });
        if (parts.length > 0) {
          var c = parts[0]
          c.part.style.fontSize = (c.size - 1) + 'px'
        }
      }
    }
  }
}

// function to reset font size manipulated by maximizeFontsize()
function resetFontsize(selector) {
  // all parent elements
  for (a of document.querySelectorAll(selector + ' .columns')) {
    // all child elements
    for (b of a.querySelectorAll('pre')) {
      b.style.display = 'block'
      b.style.fontSize = 'inherit'
      b.style.fontFamily = 'Fira Mono'
    }
  }  
}