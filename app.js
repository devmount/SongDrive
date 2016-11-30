// Setup Firebase
firebase.initializeApp(config);

var songsRef = firebase.database().ref('songs');
var authorsRef = firebase.database().ref('authors');

// component: list songs
var ListSongs = Vue.extend({
    template: '#song-list',
    firebase: {
        songs: songsRef
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

// component: add a song
var AddSong = Vue.extend({
    template: '#add-song',
    data: function () {
        return {
            newSong: {
                title: '',
                subtitle: '',
                textauthors: '',
                musicauthors: '',
                year: '',
                tuning: '',
                publisher: '',
                content: ''
            }
        }
    },
    methods: {
        createSong: function() {
            songsRef.push(this.newSong)
            this.newSong.title = ''
            this.newSong.subtitle = ''
            this.newSong.textauthors = ''
            this.newSong.musicauthors = ''
            this.newSong.year = ''
            this.newSong.tuning = ''
            this.newSong.publisher = ''
            this.newSong.content = ''
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
                tuning: this.song.tuning,
                publisher: this.song.publisher,
                content: this.song.content
            })
            router.push('/');
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
        {path: '/', component: ListSongs},
        {path: '/song/:song_id', component: ShowSong, name: 'show-song'},
        {path: '/add-song', component: AddSong},
        {path: '/song/:song_id/edit', component: EditSong, name: 'edit-song'},
        {path: '/song/:song_id/delete', component: DeleteSong, name: 'delete-song'}
    ]
});

// create Vue app
var app = new Vue({
    el: '#app',
    router: router,
    template: '<router-view></router-view>'
});