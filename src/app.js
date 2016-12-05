// Setup Firebase
firebase.initializeApp(config);

var songsRef = firebase.database().ref('songs');
var authorsRef = firebase.database().ref('authors');

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

// component: list songs
var ListSetlists = Vue.extend({
    template: '#setlist-list',
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
                content: ''
            }
        }
    },
    methods: {
        createSong: function() {
            songsRef.push(this.song)
            this.song.title = ''
            this.song.subtitle = ''
            this.song.textauthors = ''
            this.song.musicauthors = ''
            this.song.year = ''
            this.song.ccli = ''
            this.song.tuning = ''
            this.song.publisher = ''
            this.song.content = ''
            router.push('/');
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
                content: this.song.content
            })
            router.push('/');
            // router.push('/song/' + this.$route.params.song_id + '/edit');
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

// component: show song
var ShowSong = Vue.extend({
    template: '#show-song',
    data: function () {
        // get song from firebase and bind it to this.song
        this.$bindAsObject('song', songsRef.child(this.$route.params.song_id));
        return {
            song: this.song
        };
    }
});

// router
var router = new VueRouter({
    routes: [
        {path: '/', component: ListSongs, name: 'home'},
        {path: '/setlists', component: ListSetlists, name: 'setlists'},
        {path: '/song/:song_id', component: ShowSong, name: 'show-song'},
        {path: '/add-song', component: AddSong},
        {path: '/song/:song_id/edit', component: EditSong, name: 'edit-song'},
        {path: '/song/:song_id/delete', component: DeleteSong, name: 'delete-song'}
    ]
});

// create Vue app
var app = new Vue({
    el: '#app',
    router: router
});