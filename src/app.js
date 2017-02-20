// Setup admin mode (if set to false, SongDrive will be in reading mode only)
var admin = true;

// Setup Firebase
firebase.initializeApp(config);

var songsRef = firebase.database().ref('songs');
var authorsRef = firebase.database().ref('authors');
var setlistsRef = firebase.database().ref('setlists');

// Setup Notyf
var notyf = new Notyf({
    delay: 4000,
    alertIcon: 'fa fa-exclamation fa-2x',
    confirmIcon: 'fa fa-check fa-2x'  
})

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
    data: function () {
        return {
            languages: getLanguages()
        }
    },
    computed: {
        // apply filter
        filteredSongs: function () {
            var self = this;
            return filterSongs(self.songs, self.searchKey);
        }
    }
})

// partial component: setlist form fields
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
                var song = this.setlist.songs[i];
                // find song to remove in all setlist songs
                if (song == key) {
                    // remove song key from setlist songs list
                    this.setlist.songs.splice(this.setlist.songs.indexOf(song), 1);
                }
            }
        }
    },
    computed: {
        // apply filter
        filteredSongs: function () {
            var self = this;
            return filterSongs(self.songs, self.searchKey);
        }
    },
    mounted: function(){
        flatpickr(".flatpickr", {
            wrap: true,
            clickOpens: false,
            allowInput: true
        });
    }
})

// component: dashboard
var Dashboard = Vue.extend({
    template: '#dashboard',
    firebase: {
        songs: songsRef.orderByChild('title'),
        setlists: setlistsRef.orderByChild('date')
    },
    data: function () {
        return {
            shuffle: [],
            admin: admin
        };
    },
    methods: {
        // shuffle song list
        shuffleSongs: function() {
            // dummy variable to invoke recalculation of getRandomProperty()
            this.shuffle = []
        }
    },
    mounted: function() {
        // get snapshot of song list
        songsRef.on('value', function(snap) {
            // a doughnut chart for song languages
            var songs = snap.val();
            var data = [], labels = [], colors = [];
            var languages = getLanguages();
            // for each existing languages count number of songs in that language
            for (var l in languages) {
                var n = 0;
                for (var song in songs) {
                    if (songs[song].language == l) {
                        n++;
                    }
                }
                // add data to arrays
                data.push(n);
                labels.push(languages[l].label);
                colors.push(languages[l].color);
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
                }
            });
        });
        // get snapshot of setlist list
        setlistsRef.on('value', function(snap) {
            // a bar chart for number of setlists per year
            var setlists = snap.val();
            var setlistNumber = {}, songNumber = {};
            for (var setlist in setlists) {
                if (setlists[setlist].date.length > 0) {
                    var year = setlists[setlist].date.substr(0, 4);
                    if (!setlistNumber[year] || parseInt(setlistNumber[year]) < 1) {
                        setlistNumber[year] = 0;
                        songNumber[year] = 0;
                    }
                    setlistNumber[year]++;
                    songNumber[year] += setlists[setlist].songs.length;
                }
            }
            // create bar chart with setlist number arrays
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
                    }
                }
            });
            // create bar chart with song number arrays
            new Chart('songs-per-year', {
                type: 'bar',
                data: {
                    labels: Object.keys(songNumber),
                    datasets: [{
                        data: Object.keys(songNumber).map(function(key ) {return songNumber[key] }),
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
                    }
                }
            });
        });
    }
});

// component: list songs
var ListSongs = Vue.extend({
    template: '#song-list',
    firebase: {
        songs: songsRef.orderByChild('title')
    },
    data: function () {
        return {
            searchKey: '',
            admin: admin
        };
    },
    computed: {
        // apply filter
        filteredSongs: function () {
            var self = this;
            return filterSongs(self.songs, self.searchKey);
        }
    },
    mounted: function() {
        // set initial focus to search input
        document.getElementById('search').focus();
    }
});

// component: list setlists
var ListSetlists = Vue.extend({
    template: '#setlist-list',
    firebase: {
        setlists: setlistsRef.orderByChild('date')
    },
    data: function () {
        return {
            searchKey: ''
        };
    },
    computed: {
        // apply filter
        filteredSetlists: function () {
            var self = this;
            return self.setlists.filter(function (setlist) {
                // filter fields: date, title
                var key = self.searchKey.toLowerCase()
                return setlist.date.toLowerCase().indexOf(key) !== -1 || setlist.title.toLowerCase().indexOf(key) !== -1;
            });
        }
    },
    mounted: function() {
        // set initial focus to search input
        document.getElementById('search').focus();
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
            song: getSongObject(null, false),
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
                    this.tsong = getSongObject(this.tsong, false);
                    // add this.song to translations of translated song
                    this.tsong.translations.push(newsong.key);
                    songsRef.child(id).set(this.tsong);
                }, this);
            }
            notify('success', 'Song added', 'Data was successfully saved.');
            router.push('/songs');
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
            setlist: getSetlistObject(null, false),
            searchKey: ''
        }
    },
    methods: {
        createSetlist: function() {
            setlistsRef.push(this.setlist);
            notify('success', 'Setlist added', 'Data was successfully saved.');
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
            songsRef.child(this.$route.params.song_id).update(getSongObject(this.song, false));
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
                    this.tsong = getSongObject(this.tsong, false);
                    // add this.song to translations of translated song, if it not already exists
                    if (this.tsong.translations.indexOf(this.song['.key']) == -1) {
                        this.tsong.translations.push(this.song['.key']);
                    }
                    songsRef.child(id).set(this.tsong);
                }, this);
            }
            notify('success', 'Song updated', 'Data was successfully saved.');
            router.push('/song/' + this.$route.params.song_id);
        },
        back: function() {
            this.$router.go(-1);
        },
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
            setlistsRef.child(this.$route.params.setlist_id).update(getSetlistObject(this.setlist, false));
            notify('success', 'Setlist updated', 'Data was successfully saved.');
            router.push('/setlist/' + this.$route.params.setlist_id);
        },
        back: function() {
            this.$router.go(-1);
        },
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
            notify('success', 'Song deleted', 'Data was successfully deleted.');
            router.push('/songs');
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
            notify('success', 'Setlist deleted', 'Data was successfully deleted.');
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
            var doc = getPdfSongsObject(this.song, null);
            pdfMake.createPdf(doc).open();
            notify('success', 'PDF export', 'Song was successfully exported as PDF.');
        },
        exportSng: function() {
            var content = 
                '#LangCount=1' + '\n' +
                '#Title=' + this.song.title + '\n' +
                '#Author=' + this.song.authors + '\n' +
                '#(c)=' + this.song.year + ' ' + this.song.publisher.replace(/(?:\r\n|\r|\n)/g, '; ') + '\n' +
                '#Key=' + this.song.tuning + '\n' +
                '#CCLI=' + this.song.ccli + '\n' +
                '---' + '\n';
            parseSongContent(this.song.content).forEach(function(part) {
                switch (part.type) {
                    case 'v':
                        content += 'verse';
                        break;
                    case 'p':
                        content += 'pre-chorus';
                        break;
                    case 'c':
                        content += 'chorus';
                        break;
                    case 'b':
                        content += 'bridge';
                        break;
                    case 'i':
                        content += 'intro';
                        break;
                    case 'o':
                        content += 'outro';
                        break;
                    default:
                        break;
                }
                content += part.number > 0 ? ' ' + part.number : '';
                content += '\n' + removeChords(part.content) + '\n--\n';
            }, this);
            download(content, this.song.title + '.sng');
            notify('success', 'SNG export', 'Song was successfully exported as SNG.');
        },
        toggleChords: function(event) {
            // select proper button element (make sure to take the button, even if symbol tag <i> is clicked)
            var target = event.path[0].tagName == 'BUTTON' ? event.path[0] : event.path[1];
            // show text only
            if (target.value == '1') {
                // set song content to content without chords
                this.song.content = removeChords(this.song.content);
                // restyle toggle button
                target.value = '0';
                target.title = 'Show text and chords';
                target.innerHTML = '<i class="fa fa-music fa-fw" aria-hidden="true"></i>';
            }
            // show text + chords (default)
            else {
                // get original song content
                this.$bindAsObject('song', songsRef.child(this.$route.params.song_id));
                // restyle toggle button
                target.value = '1';
                target.title = 'Show text only';
                target.innerHTML = '<i class="fa fa-align-left fa-fw" aria-hidden="true"></i>';
            }
        },
        transposeChords: function() {
            // select proper button element (make sure to take the button, even if symbol tag <i> is clicked)
            var target = event.path[0].tagName == 'BUTTON' ? event.path[0] : event.path[1];
            // set song content to content transposed chords
            if (target.value == 0) {
                // reset tuning: get original song content
                this.$bindAsObject('song', songsRef.child(this.$route.params.song_id));
            } else {
                // adapt tuning
                this.song.content = transposeChords(target.value, this.song.content);
            }
        }
    }
});

// component: show song fullscreen
var PresentSong = Vue.extend({
    template: '#present-song',
    data: function () {
        // get song from firebase and bind it to this.song
        this.$bindAsObject('song', songsRef.child(this.$route.params.song_id));
        return {
            song: this.song
        };
    },
    methods: {
        // split song.content into two parts of most equal length without splitting song parts
        getTwoColumns: function (content) {
            var parts = content.split('\n\n');
            var half_length = Math.floor(parts.length / 2);    
            var leftSide = parts.splice(0, half_length);
            return [
                leftSide.join('\n\n'),
                parts.join('\n\n'),
            ];
        },
        toggleChords: function(event) {
            // select proper button element (make sure to take the button, even if symbol tag <i> is clicked)
            var target = event.path[0].tagName == 'BUTTON' ? event.path[0] : event.path[1];
            // show text only
            if (target.value == '1') {
                // set song content to content without chords
                this.song.content = removeChords(this.song.content);
                // set new class to all <pre> to restyle font
                var elements = document.getElementsByTagName('PRE');
                [].slice.call(elements).forEach(function(element) {
                    element.className += ' textonly';
                }, this);
                // restyle toggle button
                target.value = '0';
                target.title = 'Show text and chords';
                target.innerHTML = '<i class="fa fa-music fa-fw" aria-hidden="true"></i>';
            }
            // show text + chords (default)
            else {
                // get original song content
                this.$bindAsObject('song', songsRef.child(this.$route.params.song_id));
                // remove class from all <pre> to reset font
                var elements = document.getElementsByTagName('PRE');
                [].slice.call(elements).forEach(function(element) {
                    element.className = element.className.replace(/\stextonly\b/,'');
                }, this);
                // restyle toggle button
                target.value = '1';
                target.title = 'Show text only';
                target.innerHTML = '<i class="fa fa-align-left fa-fw" aria-hidden="true"></i>';
            }
        }
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
            notify('success', 'PDF export', 'Setlist was successfully exported as PDF.');
        },
        exportSongsheets: function() {
            var doc = getPdfSongsObject(this.songs, this.setlist);
            pdfMake.createPdf(doc).open();
            notify('success', 'PDF export', 'Songsheets were successfully exported as PDF.');
        }
    },
    mounted: function(){
        if (admin) {
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
                        notify('success', 'Setlist saved', 'Sorting was successfully saved.');
                    }
                }); 
            });
        }
    }
});

// component: present setlist
var PresentSetlist = Vue.extend({
    template: '#present-setlist',
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
    mounted: function(){
        // init orbit slider for presentation view
        new Foundation.Orbit($('#setlist-presentation'), {
            autoPlay: false,
            infiniteWrap: false,
            animInFromRight: 'fade-in',
            animOutToRight: 'fade-out',
            animInFromLeft: 'fade-in',
            animOutToLeft: 'fade-out',
        });
    },
    methods: {
        // split song.content into two parts of most equal length without splitting song parts
        getTwoColumns: function (content) {
            var parts = content.split('\n\n');
            var half_length = Math.floor(parts.length / 2);    
            var leftSide = parts.splice(0, half_length);
            return [
                leftSide.join('\n\n'),
                parts.join('\n\n'),
            ];
        },
        toggleChords: function(event) {
            // select proper button element (make sure to take the button, even if symbol tag <i> is clicked)
            var target = event.path[0].tagName == 'BUTTON' ? event.path[0] : event.path[1];
            // show text only
            if (target.value == '1') {
                // for each song in setlist song list set song content to content without chords
                this.songs.forEach(function(song) {
                    if (this.setlist.songs.indexOf(song['.key']) >= 0) {
                        song.content = removeChords(song.content);
                    }
                }, this);
                // set new class to all <pre> to restyle font
                var elements = document.getElementsByTagName('PRE');
                [].slice.call(elements).forEach(function(element) {
                    element.className += ' textonly';
                }, this);
                // restyle toggle button
                target.value = '0';
                target.title = 'Show text and chords';
                target.innerHTML = '<i class="fa fa-music fa-fw" aria-hidden="true"></i>';
            }
            // show text + chords (default)
            else {
                // get original setlist song content
                this.$bindAsArray('songs', songsRef);
                // remove class from all <pre> to reset font
                var elements = document.getElementsByTagName('PRE');
                [].slice.call(elements).forEach(function(element) {
                    element.className = element.className.replace(/\stextonly\b/,'');
                }, this);
                // restyle toggle button
                target.value = '1';
                target.title = 'Show text only';
                target.innerHTML = '<i class="fa fa-align-left fa-fw" aria-hidden="true"></i>';
            }
        }
    }
});

// router
var router = new VueRouter({
    routes: [
        // dashboard
        {name: 'home',            component: Dashboard,      path: '/'},
        // songs
        {name: 'songs',           component: ListSongs,      path: '/songs'},
        {name: 'add-song',        component: AddSong,        path: '/song/add'},
        {name: 'show-song',       component: ShowSong,       path: '/song/:song_id'},
        {name: 'present-song',    component: PresentSong,    path: '/song/:song_id/fullscreen'},
        {name: 'edit-song',       component: EditSong,       path: '/song/:song_id/edit'},
        {name: 'delete-song',     component: DeleteSong,     path: '/song/:song_id/delete'},
        // setlists
        {name: 'setlists',        component: ListSetlists,   path: '/setlists'},
        {name: 'add-setlist',     component: AddSetlist,     path: '/setlist/add'},
        {name: 'show-setlist',    component: ShowSetlist,    path: '/setlist/:setlist_id'},
        {name: 'edit-setlist',    component: EditSetlist,    path: '/setlist/:setlist_id/edit'},
        {name: 'delete-setlist',  component: DeleteSetlist,  path: '/setlist/:setlist_id/delete'},
        {name: 'present-setlist', component: PresentSetlist, path: '/setlist/:setlist_id/presentation'},
    ]
});

// create Vue app
var app = new Vue({
    el: '#app',
    router: router
});


/* --- Additional functions --- */

// create a single or multipage page pdf for a song or setlist (song sheets)
function getPdfSongsObject(songs, setlist) {
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

// return an array of the song configuration for pdfmake
function getPdfSongContent(song) {
    // handle song content parts
    var content = [], parts = parseSongContent(song.content);
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
    					text: part.content.toString().replace(/ /g, '\u200B')
    				}
    			]
            });
        } else {
            content.push({
                style: 'code',
                text: part.content.toString().replace(/ /g, '\u200B')
            });
        }
    }, this);
    // return array with song data
    return [
        // song title [tuning] with a line beneath
        { text: song.title.toString().toUpperCase() + (song.tuning ? '  [' + song.tuning.toString() + ']' : ''), style: 'header' },
        { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 505, y2: 0, lineWidth: .5 }] },
        // song content with respect to leading whitespaces
        // { text: song.content.toString().replace(/ /g, '\u200B'), style: 'code' },
        content,
        // imprint with ccli#, author names and (c) year publisher
        {
            style: 'copyright',
            text: [
                song.ccli ? 'CCLI Song Nr.: ' + song.ccli.toString() + '\n' : '',
                song.authors ? song.authors.toString() + '\n' : '',
                '\u00A9 ' + song.year.toString() + ' ' + song.publisher.toString()
            ]
        }
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

// download data to a file
// http://stackoverflow.com/questions/13405129/javascript-create-and-save-file
function download(data, filename) {
    var a = document.createElement("a"),
        file = new Blob([data], {encoding:"UTF-8", type:"text/plain;charset=UTF-8"});
    if (window.navigator.msSaveOrOpenBlob) // IE10+
        window.navigator.msSaveOrOpenBlob(file, filename);
    else { // Others
        var url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function() {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);  
        }, 0); 
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
        translations: song ? (noTranslations ? [] : song.translations) : []
    } 
}

// return a proper setlist object with only the properties to store/read from firebase
function getSetlistObject(setlist, noSongs) {
    // if setlist is given, return setlist with existing properties
    // else return empty property
    return {
        date:  setlist ? setlist.date : '',
        title: setlist ? setlist.title : '',
        songs: setlist ? (noSongs ? [] : setlist.songs) : []
    }
}

// return all existing languages
function getLanguages() {
    return {
        de: {key:'de', label:'German',  color:'#bbdd77'},
        en: {key:'en', label:'English', color:'#88b544'},
        fr: {key:'fr', label:'French',  color:'#5c7d2a'},
        ln: {key:'ln', label:'Lingala', color:'#445b22'},
    }
}

// check if a string represents most likely a chord line, based on the number of spaces
function isChordLine(line) {
    if (line == '') {
        return false;
    }
    var ratio = (line.split(' ').length - 1)/line.length;
    return ratio > 0.4 || (line.length < 4 && line.charAt(0) != '-');
}

// filter song list
function filterSongs(songs, searchKey) {
    return songs.filter(function (song) {
        // filter fields: title, subtitle
        var key = searchKey.toLowerCase()
        return song.title.toLowerCase().indexOf(key) !== -1 || song.subtitle.toLowerCase().indexOf(key) !== -1;
    });
}

// remove chord lines from given multiline string
function removeChords(str) {
    var lines = str.split('\n');
    var newLines = [];
    lines.forEach(function(line) {
        // identify chord lines
        if(!isChordLine(line)) {
            // only add text lines to new content
            newLines.push(line);
        }
    }, this);
    return newLines.join('\n');
}

// remove chord lines from given multiline string
function transposeChords(action, str) {
    var lines = str.split('\n'), newLines = [];
    var tunes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'B', 'H', 'C'];
    for (var key in lines) {
        // get single line
        var line = lines[key], newLine = '';
        // identify chord lines
        if(isChordLine(line)) {
            var i = 0;
            while (i < line.length) {
                // get single character in line
                var c = line[i];
                // on '#': skip to next character as it will be handled together with tune
                if (c == '#') {
                    i++;
                    continue;
                }
                var isHalf = line[i+1] == '#';
                // check if character is a tune with #
                if (isHalf) {
                    c = c + '#';
                }
                // check if character is a transposable character
                if (tunes.indexOf(c) > -1) {
                    // transpose chords up
                    if (action == 1) {
                        // replace character by next tune character
                        var nextTune = tunes[tunes.indexOf(c) + 1];
                        newLine += nextTune;
                    } else 
                    // transpose chords down
                    if (action == -1) {
                        // replace character by next tune character
                        var prevTune = tunes[tunes.lastIndexOf(c) - 1];
                        newLine += prevTune;
                    }
                } else {
                    newLine += c;
                }
                i++;
            }
        }
        // if no chord line: leave line as is
        else {
            newLine = line;
        }
        // add lines to new content
        newLines.push(newLine);
    }
    return newLines.join('\n');
}

// display notification message
function notify(type, title, text) {
    if (type == 'success') {
        notyf.confirm('<strong>' + title + '</strong><br />' + text);
    }
    if (type == 'error') {
        notyf.alert('<strong>' + title + '</strong><br />' + text);
    }
}

// parse song content
function parseSongContent(content) {
    // check if content is already loaded by firebase
    if (typeof content != 'undefined' && content) {
        // initialize arrays for parsed linex, classes of parts, type abbr., numbers of type and part index
        var parsed = [], classes = [], types = [], numbers = [], part = 0;
        var lines = content.split('\n');
        // check every content line
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            // if normal song line is found
            if (line.trim().indexOf('--') < 0) {
                // only consider line if not empty
                if (line.trim() != '') {
                    if (!parsed[part]) {
                        parsed[part] = [];
                    }
                    // add line to current part
                    parsed[part].push(line);
                }
            }
            // if song part is found (e.g. --V1)
            else {
                // add class to part
                switch (line.charAt(2)) {
                    case 'V':
                    case 'v':
                        types.push('v');
                        classes.push('verse ' + ((!isNaN(parseInt(line.trim().charAt(3)))) ? 'part' + line.trim().charAt(3) : ''));
                        numbers.push((!isNaN(parseInt(line.trim().charAt(3)))) ? line.trim().charAt(3) : '0');
                        break;
                    case 'P':
                    case 'p':
                        types.push('p');
                        classes.push('prechorus');
                        numbers.push((!isNaN(parseInt(line.trim().charAt(3)))) ? line.trim().charAt(3) : '0');
                        break;
                    case 'C':
                    case 'c':
                        types.push('c');
                        classes.push('chorus');
                        numbers.push((!isNaN(parseInt(line.trim().charAt(3)))) ? line.trim().charAt(3) : '0');
                        break;
                    case 'B':
                    case 'b':
                        types.push('b');
                        classes.push('bridge');
                        numbers.push((!isNaN(parseInt(line.trim().charAt(3)))) ? line.trim().charAt(3) : '0');
                        break;
                    case 'I':
                    case 'i':
                        types.push('i');
                        classes.push('intro');
                        numbers.push((!isNaN(parseInt(line.trim().charAt(3)))) ? line.trim().charAt(3) : '0');
                        break;
                    case 'O':
                    case 'o':
                        types.push('o');
                        classes.push('outro');
                        numbers.push((!isNaN(parseInt(line.trim().charAt(3)))) ? line.trim().charAt(3) : '0');
                        break;
                    default:
                        console.log('Ooops, something went wrong on parsing this line: "' + line + '"');
                }
                // consider next part
                part++;
            }
        }
        var newContent = [];
        // if multiple parts: rejoin lines of every part
        if (parsed.length > 1) {
            for (var i = 1; i < parsed.length; i++) {
                newContent.push({
                    type: types[i-1],
                    number: numbers[i-1],
                    class: classes[i-1],
                    content: parsed[i].join('\n')
                });
            }
        }
        // if no parts (no markers set): take whole content as one unclassified part
        else {
            newContent.push({
                class: '',
                content: content
            });
        }
        return newContent;
    }
    // show nothing if content is not set
    return '';
}

// get <n> different random properties from given object
function getRandomProperty(obj, n) {
    // get object keys
    var keys = Object.keys(obj), elements = [];
    for (var i = 0; i < n; i++) {
        // add a property of random key in obj
        var key = keys.length * Math.random() << 0;
        elements.push(obj[keys[key]]);
        // delete that key for avoiding duplicates
        keys.splice(key, 1);
    }
    return elements;
};