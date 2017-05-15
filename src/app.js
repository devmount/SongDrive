// SongDrive version
var VERSION = '0.1.257';

// Setup admin mode (if set to false, SongDrive will be in reading mode only)
var ADMIN = true;

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

// Setup ChartJS
Chart.defaults.global.defaultFontFamily     = 'Fira Sans';
Chart.defaults.global.title.display         = true;
Chart.defaults.global.title.fontSize        = 24;
Chart.defaults.global.title.fontColor       = '#000';
Chart.defaults.global.title.fontStyle       = '300';
Chart.defaults.global.title.padding         = 15;
Chart.defaults.global.legend.position       = 'bottom';
Chart.defaults.global.tooltips.cornerRadius = 0;
Chart.defaults.global.tooltips.xPadding     = 10;
Chart.defaults.global.tooltips.yPadding     = 10;

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
            shuffle: []
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
                },
                options: {
                    title: {
                        text: 'LANGUAGES'
                    }
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
                    if (setlists[setlist].songs) {
                        songNumber[year] += setlists[setlist].songs.length;
                    }
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
                    },
                    title: {
                        text: 'SETLISTS PER YEAR'
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
                    },
                    title: {
                        text: 'SONGS PER YEAR'
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
            searchKey: ''
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
        // initialize foundation plugins: dropdown
        $(document).foundation();
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
        // initialize foundation plugins: dropdown
        $(document).foundation();
    }
});

// component: add a song
var AddSong = Vue.extend({
    template: '#add-song',
    firebase: {
        songs: songsRef.orderByChild('title')
    },
    data: function () {
        var song = {}, isCloned = false;
        // check if an existing song should be used as template: song id exists
        if (this.$route.params.song_id) {
            // get existing song content
            this.$bindAsObject('clone', songsRef.child(this.$route.params.song_id));
            song = getSongObject(this.clone, !this.clone.hasOwnProperty('translations'));
            isCloned = true;
        } else {
            // get empty song object
            song = getSongObject(null, true);
        }
        return {
            song: song,
            isCloned: isCloned,
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
        var setlist = {}, isCloned = false;
        // check if an existing setlist should be used as template: setlist id exists
        if (this.$route.params.setlist_id) {
            // get existing setlist content
            this.$bindAsObject('clone', setlistsRef.child(this.$route.params.setlist_id));
            setlist = getSetlistObject(this.clone, !this.clone.hasOwnProperty('songs'));
            isCloned = true;
        } else {
            // get empty setlist object
            setlist = getSetlistObject(null, true);
        }
        return {
            setlist: setlist,
            isCloned: isCloned,
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

// component: clone setlist
var CloneSetlist = Vue.extend({
    template: '#clone-setlist',
    data: function () {
        // get setlist from firebase and bind it to this.setlist
        this.$bindAsObject('setlist', setlistsRef.child(this.$route.params.setlist_id));
        return {
            setlist: this.setlist
        };
    },
    methods: {
        cloneSetlist: function() {
            // create new setlist with given setlist
            clonedSetlist = getSetlistObject(this.setlist, false);
            // updated title to indicate cloned item
            clonedSetlist.title = this.setlist.title + ' cloned';
            // set date to today's date
            clonedSetlist.date = getCurrentDate();
            setlistsRef.push(clonedSetlist);
            notify('success', 'Setlist cloned', 'Setlist was successfully cloned.');
            router.push('/setlists');
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
            songs: this.songs,
            textOnly: false,
            tuning: 0
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
        toggleChords: function(textOnly) {
            // update toggle button
            this.textOnly = textOnly;
            // show text without chord lines
            if (textOnly) {
                // set song content to content without chords
                this.song.content = removeChords(this.song.content);
            }
            // show text + chords (default)
            else {
                // get original song content
                this.$bindAsObject('song', songsRef.child(this.$route.params.song_id));
            }
        },
        transposeChords: function(mode) {
            // set song content to content transposed chords
            if (mode == 0) {
                // reset tuning: get original song content
                this.tuning = 0;
                this.$bindAsObject('song', songsRef.child(this.$route.params.song_id));
            } else {
                // adapt tuning and update song content
                this.tuning += mode;
                this.song.content = transposeChords(mode, this.song.content);
            }
        }
    }
});

// component: export song as copyable text
var TxtSong = Vue.extend({
    template: '#txt-song',
    firebase: {
        songs: songsRef
    },
    data: function () {
        // get song from firebase and bind it to this.song
        this.$bindAsObject('song', songsRef.child(this.$route.params.song_id));
        return {
            song: this.song,
            songs: this.songs,
            textOnly: true
        };
    },
    methods: {
        toggleChords: function(textOnly) {
            // update toggle button
            this.textOnly = textOnly;
            // show text without chord lines
            if (textOnly) {
                // set song content to content without chords
                this.song.content = removeChords(this.song.content);
            }
            // show text + chords (default)
            else {
                // get original song content
                this.$bindAsObject('song', songsRef.child(this.$route.params.song_id));
            }
        },
        transposeChords: function(mode) {
            // set song content to content transposed chords
            if (mode == 0) {
                // reset tuning: get original song content
                this.$bindAsObject('song', songsRef.child(this.$route.params.song_id));
            } else {
                // adapt tuning
                this.song.content = transposeChords(mode, this.song.content);
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
        // check if tuning is set and transpose song content accordingly
        var tuning = this.$route.params.tuning;
        if (tuning && tuning > 0) {
            for (var i = 0; i < tuning; i++) {
                this.song.content = transposeChords(1, this.song.content);
            }
        }
        else if (tuning && tuning < 0) {
            for (var i = 0; i < tuning*(-1); i++) {
                this.song.content = transposeChords(-1, this.song.content);
            }
        }
        return {
            song: this.song,
            textOnly: false
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
        toggleChords: function(textOnly) {
            // update toggle button
            this.textOnly = textOnly;
            // show text only
            if (textOnly) {
                // set song content to content without chords
                this.song.content = removeChords(this.song.content);
            }
            // show text + chords (default)
            else {
                // get original song content
                this.$bindAsObject('song', songsRef.child(this.$route.params.song_id));
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
        setlistsRef.child(this.$route.params.setlist_id).on('value', function(setlistSnap) {
            songsRef.on('value', function(songSnap) {
                // a doughnut chart for setlist languages
                var setlist = setlistSnap.val();
                var songs = songSnap.val();
                var data = [], labels = [], colors = [];
                var languages = getLanguages();
                if (setlist.songs) {
                    // for each existing languages count number of setlist songs in that language
                    for (var l in languages) {
                        var n = 0;
                        for (var i in setlist.songs) {
                            for (var j in songs) {
                                if (j == setlist.songs[i] && songs[j].language == l) {
                                    n++;
                                }
                            }
                        }
                        // add data to arrays
                        if (n > 0) {
                            data.push(n);
                            labels.push(languages[l].label);
                            colors.push(languages[l].color);
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
                            animation:{
                                animateRotate: false
                            },
                            title: {
                                text: 'LANGUAGES'
                            }
                        }
                    });
                }
            });
        });

        // make setlist sortable
        if (ADMIN) {
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
            setlist: this.setlist,
            textOnly: false
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
        toggleChords: function(textOnly) {
            // update toggle button
            this.textOnly = textOnly;
            // show text only
            if (textOnly) {
                // for each song in setlist song list set song content to content without chords
                this.songs.forEach(function(song) {
                    if (this.setlist.songs.indexOf(song['.key']) >= 0) {
                        song.content = removeChords(song.content);
                    }
                }, this);
            }
            // show text + chords (default)
            else {
                // get original setlist song content
                this.$bindAsArray('songs', songsRef);
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
        {name: 'present-song',    component: PresentSong,    path: '/song/:song_id/fullscreen/:tuning'},
        {name: 'edit-song',       component: EditSong,       path: '/song/:song_id/edit'},
        {name: 'clone-song',      component: AddSong,        path: '/song/:song_id/clone'},
        {name: 'delete-song',     component: DeleteSong,     path: '/song/:song_id/delete'},
        {name: 'txt-song',        component: TxtSong,        path: '/song/:song_id/txt'},
        // setlists
        {name: 'setlists',        component: ListSetlists,   path: '/setlists'},
        {name: 'add-setlist',     component: AddSetlist,     path: '/setlist/add'},
        {name: 'show-setlist',    component: ShowSetlist,    path: '/setlist/:setlist_id'},
        {name: 'edit-setlist',    component: EditSetlist,    path: '/setlist/:setlist_id/edit'},
        {name: 'clone-setlist',   component: AddSetlist,     path: '/setlist/:setlist_id/clone'},
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
                titles.push((j+1) + '.  \u2012  ' + songs[i]['title'] + '  [' + songs[i]['tuning'] + ']');
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
    return ratio > 0.25 || (line.length < 4 && line.charAt(0) != '-');
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
    var TUNES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'B', 'H', 'C'];
    for (var key in lines) {
        // get single line
        var line = lines[key]
        // init the new line to build and the current over- or underflow of spaces due to different chord string lenghts
        var newLine = '', spaces = 0;
        // identify chord lines
        if(isChordLine(line)) {
            var i = 0;
            while (i < line.length) {
                // get single character in line
                var c = line[i];
                // handle over- or underflow of spaces
                if (spaces > 0 && c == ' ') {
                    // to few spaces: double next existing space and decrease space count
                    c = '  ';
                    spaces--;
                }
                if (spaces < 0 && c == ' ' && line[i+1] == ' ') {
                    // to many spaces: skip one of two consecutive spaces and increase space count
                    spaces++;
                    i++;
                    continue;
                }
                // on '#': skip to next character as it will be handled together with tune
                if (c == '#') {
                    i++;
                    continue;
                }
                var isHalf = line[i+1] == '#';
                // check if character is a tune with '#'
                if (isHalf) {
                    c = c + '#';
                }
                // check if character is a transposable character
                if (TUNES.indexOf(c) > -1) {
                    // transpose chords up
                    if (action == 1) {
                        // replace character by next tune character
                        var nextTune = TUNES[TUNES.indexOf(c) + 1];
                        newLine += nextTune;
                        // update over- or underflow of spaces
                        spaces += c.length - nextTune.length;
                    } else 
                    // transpose chords down
                    if (action == -1) {
                        // replace character by next tune character
                        var prevTune = TUNES[TUNES.lastIndexOf(c) - 1];
                        newLine += prevTune;
                        // update over- or underflow of spaces
                        spaces += c.length - prevTune.length;
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

// parse txt song content
function parseTxtSongContent(content) {
    // initialize arrays for parsed lines
    var parsed = [];
    var lines = content.split('\n');
    // check every content line
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        // if normal song line is found
        if (line.trim().indexOf('--') < 0) {
            // add line
            parsed.push(line);
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
    return parsed.join('\n');
}

// parse song content
function parseSongContent(content) {
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

// get current date in yyyy-mm-dd format
// http://stackoverflow.com/questions/1531093/how-do-i-get-the-current-date-in-javascript
function getCurrentDate() {
    // get current date object
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1; //January is 0!
    var yyyy = today.getFullYear();
    // add preceding zeros
    if(dd < 10) {
        dd = '0' + dd
    } 
    if(mm < 10) {
        mm = '0' + mm
    }
    // return formatted date
    return yyyy + '-' + mm + '-' + dd;
};

