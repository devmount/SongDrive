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
        song: this.song,
        songs: this.songs,
        searchKey: this.searchKey
    },
    computed: {
        // apply filter
        filteredSongs: function () {
            var self = this;
            return self.songs.filter(function (song) {
                // filter fields: title, subtitle
                var key = self.searchKey.toLowerCase()
                return song.title.toLowerCase().indexOf(key) !== -1 || song.subtitle.toLowerCase().indexOf(key) !== -1;
            });
        }
    }
})

// partial component: song form fields
Vue.component('setlist-form-fields', {
    template: '#setlist-form-fields',
    props: {
        setlist: this.setlist,
        songs: this.songs,
        searchKey: this.searchKey
    },
    computed: {
        // apply filter
        filteredSongs: function () {
            var self = this;
            return self.songs.filter(function (song) {
                // filter fields: title, subtitle
                var key = self.searchKey.toLowerCase()
                return song.title.toLowerCase().indexOf(key) !== -1 || song.subtitle.toLowerCase().indexOf(key) !== -1;
            });
        }
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
                var key = self.searchKey.toLowerCase()
                return song.title.toLowerCase().indexOf(key) !== -1 || song.subtitle.toLowerCase().indexOf(key) !== -1;
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
                var key = self.searchKey.toLowerCase()
                return setlist.date.toLowerCase().indexOf(key) !== -1 || setlist.title.toLowerCase().indexOf(key) !== -1;
            });
        }
    }
});

// component: add a song
var AddSong = Vue.extend({
    template: '#add-song',
    firebase: {
        songs: songsRef.orderByChild('title')
    },
    data: function () {
        return {
            song: getSongObject(),
            searchKey: ''
        }
    },
    methods: {
        createSong: function() {
            var newsong = songsRef.push(this.song);
            // update all songs that are a translation with back link
            if (this.song.translations && this.song.translations.length > 0) {
                this.song.translations.forEach(function(id) {
                    // get translated song
                    this.$bindAsObject('tsong', songsRef.child(id));
                    // set 'translations' property if not exists
                    if (!this.tsong.hasOwnProperty('translations')) {
                        this.tsong.translations = [];
                    }
                    // get proper song object
                    this.tsong = getSongObject(this.tsong);
                    // add this.song to translations of translated song
                    this.tsong.translations.push(newsong.key);
                    songsRef.child(id).set(this.tsong);
                }, this);
            }
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
            setlist: getSetlistObject(),
            searchKey: ''
        }
    },
    methods: {
        createSetlist: function() {
            setlistsRef.push(this.setlist)
            router.push('/setlists');
        }
    },
    mounted: function(){
        var self = this;
        self.$nextTick(function(){
            // make song table rows sortable (drag and drop)
            var sortable = Sortable.create(document.getElementById('change-setlist-sort'), {
                // on drop: clone items, set new order and update setlist with new ordered items
                onEnd: function(e) {
                    var clonedItems = self.setlist.songs.filter(function(item){
                        return item;
                    });
                    clonedItems.splice(e.newIndex, 0, clonedItems.splice(e.oldIndex, 1)[0]);
                    self.$nextTick(function(){
                        // update setlist objects's songs with new order
                        self.setlist.songs = clonedItems;
                    });
                }
            }); 
        });
    }
});

// component: edit a song
var EditSong = Vue.extend({
    template: '#edit-song',
    firebase: {
        songs: songsRef.orderByChild('title')
    },
    data: function () {
        // get song from firebase and bind it to this.song
        this.$bindAsObject('song', songsRef.child(this.$route.params.song_id));
        if (!('translations' in this.song)) {
            this.song = getSongObject(this.song, true);
        }
        return {
            song: this.song,
            searchKey: ''
        };
    },
    methods: {
        updateSong: function() {
            // update song data
            songsRef.child(this.$route.params.song_id).update(getSongObject(this.song));
            // update all songs that are a translation with back link
            if (this.song.translations && this.song.translations.length > 0) {
                this.song.translations.forEach(function(id) {
                    // get translated song
                    this.$bindAsObject('tsong', songsRef.child(id));
                    // set 'translations' property if not exists
                    if (!this.tsong.hasOwnProperty('translations')) {
                        this.tsong.translations = [];
                    }
                    // get proper song object
                    this.tsong = getSongObject(this.tsong);
                    // add this.song to translations of translated song, if it not already exists
                    if (this.tsong.translations.indexOf(this.song['.key']) == -1) {
                        this.tsong.translations.push(this.song['.key']);
                    }
                    songsRef.child(id).set(this.tsong);
                }, this);
            }
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
        if (!('songs' in this.setlist)) {
            this.setlist = getSetlistObject(this.setlist, true);
        }
        return {
            setlist: this.setlist,
            searchKey: ''
        };
    },
    methods: {
        updateSetlist: function() {
            setlistsRef.child(this.$route.params.setlist_id).update(getSetlistObject(this.setlist));
            router.push('/setlists');
            // router.push('/setlist/' + this.$route.params.setlist_id + '/edit');
        }
    },
    mounted: function(){
        var self = this;
        self.$nextTick(function(){
            // make song table rows sortable (drag and drop)
            var sortable = Sortable.create(document.getElementById('change-setlist-sort'), {
                // on drop: clone items, set new order and update setlist with new ordered items
                onEnd: function(e) {
                    var clonedItems = self.setlist.songs.filter(function(item){
                        return item;
                    });
                    clonedItems.splice(e.newIndex, 0, clonedItems.splice(e.oldIndex, 1)[0]);
                    self.$nextTick(function(){
                        // update setlist objects's songs with new order
                        self.setlist.songs = clonedItems;
                    });
                }
            }); 
        });
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
    firebase: {
        songs: songsRef
    },
    data: function () {
        // get song from firebase and bind it to this.song
        this.$bindAsObject('song', songsRef.child(this.$route.params.song_id));
        return {
            song: this.song,
            songs: this.songs
        };
    },
    methods: {
        exportPdf: function() {
            var doc = getPdfSongsObject(this.song);
            pdfMake.createPdf(doc).open();
            router.push('/song/' + this.$route.params.song_id);
        }
    },
    watch: {
        '$route' (to, from) {
            router.push(to.path);
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
        if (!('songs' in this.setlist)) {
            this.setlist.songs = [];
        }
        return {
            setlist: this.setlist
        };
    },
    methods: {
        exportSetlist: function() {
            var doc = getPdfSetlistObject(this.setlist, this.songs);
            pdfMake.createPdf(doc).open();
            router.push('/setlist/' + this.$route.params.setlist_id);
        },
        exportSongsheets: function() {
            var doc = getPdfSongsObject(this.songs, this.setlist);
            pdfMake.createPdf(doc).open();
            router.push('/setlist/' + this.$route.params.setlist_id);
        }
    },
    mounted: function(){
        var self = this;
        self.$nextTick(function(){
            // make song table rows sortable (drag and drop)
            var sortable = Sortable.create(document.getElementById('show-setlist-sort'), {
                // on drop: clone items, set new order and update setlist with new ordered items
                onEnd: function(e) {
                    var clonedItems = self.setlist.songs.filter(function(item){
                        return item;
                    });
                    clonedItems.splice(e.newIndex, 0, clonedItems.splice(e.oldIndex, 1)[0]);
                    self.$nextTick(function(){
                        // update setlist's songs with new order
                        setlistsRef.child(this.$route.params.setlist_id).update({songs: clonedItems});
                    });
                }
            }); 
        });
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

// create a single or multipage page pdf for a song or setlist (song sheets)
function getPdfSongsObject(songs, setlist = null) {
    var content = [];
    // create multiple songsheets in one PDF
    if (setlist) {
        for (var j = 0; j < setlist.songs.length; j++) {
            for (var i = 0; i < songs.length; i++) {
                if (songs[i]['.key'] == setlist.songs[j]) {
                    var song = songs[i];
                    // add song content
                    content = content.concat(getPdfSongContent(song));
                    // add page break after every song exept for the last
                    if (j < setlist.songs.length-1) {
                        content.push({ text: '', pageBreak: 'after' });
                    }
                }
            }
        }
    }
    // create only one songsheet (songs contains only a single song)
    else {
        var song = songs;
        content = content.concat(getPdfSongContent(song));
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
            code: {
                font: 'FiraMono',
                fontSize: 10.5,
                margin: [ 0, 15 ]
            },
            copyright: {
                font: 'FiraSans',
                fontSize: 8,
                alignment: 'right'
            }
        }
    }
}

// return an array of the song configuration for pdfmake
function getPdfSongContent(song) {
    return [
        // song title [tuning] with a line beneath
        { text: song.title.toString().toUpperCase() + (song.tuning ? '  [' + song.tuning.toString() + ']' : ''), style: 'header' },
        { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 505, y2: 0, lineWidth: .5 }] },
        // song content with respect to leading whitespaces
        { text: song.content.toString().replace(/ /g, '\u200B'), style: 'code' },
        // imprint with ccli#, author names and (c) year publisher
        { text: song.ccli ? 'CCLI: ' + song.ccli.toString() : '', style: 'copyright' },
        { text: song.authors ? song.authors.toString() : '', style: 'copyright' },
        { text: '\u00A9 ' + song.year.toString() + ' ' + song.publisher.toString(), style: 'copyright' }
    ]
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
    // return page configuration with setlist content
    return {
        pageSize: 'A4',
        pageMargins: [ 60, 50, 40, 60 ],
        content: [
            { text: setlist.date.toString() + '  ' + setlist.title.toString().toUpperCase(), style: 'header' },
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

// return a clean song object with only the properties to store/read from firebase
function getSongObject(song = null, noTranslations = false) {
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
        translations: song ? (noTranslations ? [] : song.translations) : []
    } 
}

// return a clean setlist object with only the properties to store/read from firebase
function getSetlistObject(setlist = null, noSongs = false) {
    // if setlist is given, return setlist with existing properties
    // else return empty property
    return {
        date:  setlist ? setlist.date : '',
        title: setlist ? setlist.title : '',
        songs: setlist ? (noSongs ? [] : setlist.songs) : []
    }
}