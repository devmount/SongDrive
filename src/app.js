// Setup Firebase
firebase.initializeApp(config);

var songsRef = firebase.database().ref('songs');
var authorsRef = firebase.database().ref('authors');
var setlistsRef = firebase.database().ref('setlists');

// snippet to add fields
// songsRef.on('child_added', function(snapshot) {
//     snapshot.ref.update({ note: '' });
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
        setlist: this.setlist
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
                textauthors: '',
                musicauthors: '',
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
            this.song.textauthors = '';
            this.song.musicauthors = '';
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
    data: function () {
        return {
            setlist: {
                date: '',
                title: '',
                songs: ''
            }
        }
    },
    methods: {
        createSetlist: function() {
            setlistsRef.push(this.setlist)
            this.setlist.date = ''
            this.setlist.title = ''
            this.setlist.songs = ''
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
                textauthors: this.song.textauthors,
                musicauthors: this.song.musicauthors,
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
            var doc = new jsPDF();
            doc.text(this.song.title, 10, 10);
            doc.text(this.song.subtitle, 10, 10);
            doc.save('song.pdf');
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
    data: function () {
        // get setlist from firebase and bind it to this.setlist
        this.$bindAsObject('setlist', setlistsRef.child(this.$route.params.setlist_id));
        return {
            setlist: this.setlist
        };
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