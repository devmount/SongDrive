// Setup Firebase
firebase.initializeApp(config);

var songsRef = firebase.database().ref('songs');
var authorsRef = firebase.database().ref('authors');
var setlistsRef = firebase.database().ref('setlists');

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

// snippet to add fields
// songsRef.on('child_added', function(snapshot) {
//     snapshot.ref.update({ translations: '' });
// });

// global component: app header
Vue.component('app-header', {
    template: '#app-header'
})

// global component: app footer
Vue.component('app-footer', {
    template: '#app-footer'
})

// partial component: song form fields
Vue.component('song-form-fields', {
    template: '#song-form-fields',
    props: {
        song: this.song
    }
})

// partial component: song form fields
Vue.component('setlist-form-fields', {
    template: '#setlist-form-fields',
    props: {
        setlist: this.setlist,
        songs: this.songs
    }
})

// component: list songs
var ListSongs = Vue.extend({
    template: '#song-list',
    firebase: {
        songs: songsRef.orderByChild('title')
    },
    data: function () {
        return {searchKey: ''};
    },
    computed : {
        // apply filter
        filteredSongs: function () {
            var self = this;
            return self.songs.filter(function (song) {
                // filter fields: title, subtitle
                var searchKey = self.searchKey.toLowerCase()
                return song.title.toLowerCase().indexOf(searchKey) !== -1 || song.subtitle.toLowerCase().indexOf(searchKey) !== -1;
            });
        }
    }
});

// component: list setlists
var ListSetlists = Vue.extend({
    template: '#setlist-list',
    firebase: {
        setlists: setlistsRef.orderByChild('date')
    },
    data: function () {
        return {searchKey: ''};
    },
    computed : {
        // apply filter
        filteredSetlists: function () {
            var self = this;
            return self.setlists.filter(function (setlist) {
                // filter fields: date, title
                var searchKey = self.searchKey.toLowerCase()
                return setlist.date.toLowerCase().indexOf(searchKey) !== -1 || setlist.title.toLowerCase().indexOf(searchKey) !== -1;
            });
        }
    }
});

// component: add a song
var AddSong = Vue.extend({
    template: '#add-song',
    data: function () {
        return {
            song: {
                title: '',
                subtitle: '',
                authors: '',
                year: '',
                ccli: '',
                tuning: '',
                publisher: '',
                content: '',
                language: '',
                note: ''
            }
        }
    },
    methods: {
        createSong: function() {
            songsRef.push(this.song)
            this.song.title = '';
            this.song.subtitle = '';
            this.song.authors = '';
            this.song.year = '';
            this.song.ccli = '';
            this.song.tuning = '';
            this.song.publisher = '';
            this.song.content = '';
            this.song.language = '';
            this.song.note = '';
            router.push('/');
        }
    }
});

// component: add a setlist
var AddSetlist = Vue.extend({
    template: '#add-setlist',
    firebase: {
        songs: songsRef.orderByChild('title')
    },
    data: function () {
        return {
            setlist: {
                date: '',
                title: '',
                songs: []
            }
        }
    },
    methods: {
        createSetlist: function() {
            setlistsRef.push(this.setlist)
            this.setlist.date = ''
            this.setlist.title = ''
            this.setlist.songs = []
            router.push('/setlists');
        }
    }
});

// component: edit a song
var EditSong = Vue.extend({
    template: '#edit-song',
    data: function () {
        // get song from firebase and bind it to this.song
        this.$bindAsObject('song', songsRef.child(this.$route.params.song_id));
        return {
            song: this.song
        };
    },
    methods: {
        updateSong: function() {
            songsRef.child(this.$route.params.song_id).update({
                title: this.song.title,
                subtitle: this.song.subtitle,
                authors: this.song.authors,
                year: this.song.year,
                ccli: this.song.ccli,
                tuning: this.song.tuning,
                publisher: this.song.publisher,
                content: this.song.content,
                language: this.song.language,
                note: this.song.note
            })
            router.push('/');
            // router.push('/song/' + this.$route.params.song_id + '/edit');
        }
    }
});

// component: edit a setlist
var EditSetlist = Vue.extend({
    template: '#edit-setlist',
    firebase: {
        songs: songsRef.orderByChild('title')
    },
    data: function () {
        // get setlist from firebase and bind it to this.setlist
        this.$bindAsObject('setlist', setlistsRef.child(this.$route.params.setlist_id));
        return {
            setlist: this.setlist
        };
    },
    methods: {
        updateSetlist: function() {
            setlistsRef.child(this.$route.params.setlist_id).update({
                date: this.setlist.date,
                title: this.setlist.title,
                songs: this.setlist.songs
            })
            router.push('/setlists');
            // router.push('/setlist/' + this.$route.params.setlist_id + '/edit');
        }
    }
});

// component: delete song
var DeleteSong = Vue.extend({
    template: '#delete-song',
    data: function () {
        // get song from firebase and bind it to this.song
        this.$bindAsObject('song', songsRef.child(this.$route.params.song_id));
        return {
            song: this.song
        };
    },
    methods: {
        removeSong: function() {
            songsRef.child(this.$route.params.song_id).remove();
            router.push('/');
        }
    }
});

// component: delete setlist
var DeleteSetlist = Vue.extend({
    template: '#delete-setlist',
    data: function () {
        // get setlist from firebase and bind it to this.setlist
        this.$bindAsObject('setlist', setlistsRef.child(this.$route.params.setlist_id));
        return {
            setlist: this.setlist
        };
    },
    methods: {
        removeSetlist: function() {
            setlistsRef.child(this.$route.params.setlist_id).remove();
            router.push('/setlists');
        }
    }
});

// component: show song
var ShowSong = Vue.extend({
    template: '#show-song',
    data: function () {
        // get song from firebase and bind it to this.song
        this.$bindAsObject('song', songsRef.child(this.$route.params.song_id));
        return {
            song: this.song
        };
    },
    methods: {
        exportPdf: function() {
            var doc = getPdfSongObject(this.song);
            pdfMake.createPdf(doc).open();
            router.push('/song/' + this.$route.params.song_id);
        }
    }
});

// component: show song fullscreen
var ShowSongFullscreen = Vue.extend({
    template: '#show-song-fullscreen',
    data: function () {
        // get song from firebase and bind it to this.song
        this.$bindAsObject('song', songsRef.child(this.$route.params.song_id));
        return {
            song: this.song
        };
    }
});

// component: show setlist
var ShowSetlist = Vue.extend({
    template: '#show-setlist',
    firebase: {
        songs: songsRef
    },
    data: function () {
        // get setlist from firebase and bind it to this.setlist
        this.$bindAsObject('setlist', setlistsRef.child(this.$route.params.setlist_id));
        return {
            setlist: this.setlist
        };
    },
    methods: {
        exportSetlist: function() {
            // console.log(this.songs);
            var doc = getPdfSetlistObject(this.setlist, this.songs);
            pdfMake.createPdf(doc).open();
            router.push('/setlist/' + this.$route.params.setlist_id);
        }
    }
});

// router
var router = new VueRouter({
    routes: [
        {path: '/', component: ListSongs, name: 'home'},
        {path: '/song/add', component: AddSong},
        {path: '/song/:song_id', component: ShowSong, name: 'show-song'},
        {path: '/song/:song_id/fullscreen', component: ShowSongFullscreen, name: 'show-song-fullscreen'},
        {path: '/song/:song_id/edit', component: EditSong, name: 'edit-song'},
        {path: '/song/:song_id/delete', component: DeleteSong, name: 'delete-song'},
        {path: '/setlists', component: ListSetlists, name: 'setlists'},
        {path: '/setlist/add', component: AddSetlist},
        {path: '/setlist/:setlist_id', component: ShowSetlist, name: 'show-setlist'},
        {path: '/setlist/:setlist_id/edit', component: EditSetlist, name: 'edit-setlist'},
        {path: '/setlist/:setlist_id/delete', component: DeleteSetlist, name: 'delete-setlist'}
    ]
});

// create Vue app
var app = new Vue({
    el: '#app',
    router: router
});


/* --- Additional functions --- */

// create a single page pdf for a song 
function getPdfSongObject(song) {
    return {
        pageSize: 'A4',
        pageMargins: [ 60, 50, 40, 60 ],
        content: [
            { text: song.title.toString().toUpperCase() + '  [' + song.tuning.toString() + ']', style: 'header' },
            { canvas: [
                {
                    type: 'line',
                    x1: 0, y1: 0,
                    x2: 480, y2: 0,
                    lineWidth: .5
                }
            ]},
            { text: ' ' },
            { text: song.content.toString().replace(/ /g, '\u200B'), style: 'code' }
        ],
        footer: {
            stack: [
                { text: 'CCLI: ' + song.ccli.toString(), style: 'copyright' },
                { text: song.authors.toString(), style: 'copyright' },
                { text: '\u00A9 ' + song.year.toString() + ' ' + song.publisher.toString(), style: 'copyright' },
            ],
            margin: [40,0]
        },
        styles: {
            header: {
                font: 'FiraSans',
                fontSize: 22
            },
            code: {
                font: 'FiraMono',
                fontSize: 10.5
            },
            copyright: {
                font: 'FiraSans',
                fontSize: 8
            }
        }
    }
}

// create a single page pdf for a setlist 
function getPdfSetlistObject(setlist, songs) {
    // get all titles from songs of setlist
    var titles = [];
    for (var j = 0; j < setlist.songs.length; j++) {
        for (var i = 0; i < songs.length; i++) {
            if (songs[i]['.key'] == setlist.songs[j]) {
                titles.push((j+1) + '.  \u2012  ' + songs[i]['title']);
            }
        }
    }
    return {
        pageSize: 'A4',
        pageMargins: [ 60, 50, 40, 60 ],
        content: [
            { text: setlist.date.toString() + ' ' + setlist.title.toString().toUpperCase(), style: 'header' },
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
            { text: titles.join('\n'), style: 'standard' }
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