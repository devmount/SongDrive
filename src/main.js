// init app
import { createApp } from 'vue';
import App from '@/App.vue';
const app = createApp(App);

// init router
import router from './router'
app.use(router);

// set firebase db config
import firebase from 'firebase/compat/app';
const conf = {
	apiKey:        String(process.env.VUE_APP_FB_API_KEY),
	authDomain:    process.env.VUE_APP_FB_PROJECT_ID + ".firebaseapp.com",
	databaseURL:   "https://" + process.env.VUE_APP_FB_PROJECT_ID + ".firebaseio.com",
	projectId:     String(process.env.VUE_APP_FB_PROJECT_ID),
	storageBucket: process.env.VUE_APP_FB_PROJECT_ID + ".appspot.com"
};
let firebaseApp = firebase.initializeApp(conf);

// set global properties
app.config.globalProperties.$db = firebaseApp.firestore();
app.config.globalProperties.$version = process.env.VUE_APP_VERSION;

// ionicons
import { IonIcon } from '@ionic/vue';
app.component('ion-icon', IonIcon);

// vue-notification
import Notifications from '@kyvg/vue3-notification';
app.use(Notifications);

// vue-sortable
import Sortable from 'sortablejs';
app.directive('sortable', {
	inserted (el, binding) {
		new Sortable(el, binding.value || {});
	}
});

// vue-clipboard2
import VueClipboard from 'vue-clipboard2';
app.use(VueClipboard);

// vue-i18n
import { createI18n } from 'vue-i18n/index';
const messages = {
	"de": require("./locales/de.json"), // German
	"en": require("./locales/en.json"), // English
};
const loc = navigator.language || navigator.userLanguage;
const i18n = createI18n({
	locale: loc,
	fallbackLocale: "en",
  messages
});
app.use(i18n);

// global mixins
let isChordLine = (line) => {
	if (line.trim() == '') return false;
	return line.slice(-2) === '  ';
};
let keyScale = () => ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'B', 'H'];

app.mixin({
  methods: {
		// icon (name) {
		// 	return allIcons[name];
		// },
		// scale to use for song tuning and transponation
		keyScale: keyScale,
		/*
			user roles and permissions: Administrator, Editor, Performer and Reader
			 A E P R                                              
			------------------------------------------------------
			 x x x x  see dashboard, song list and setlist list   
			 x x x x  see single songs (present, tune, export)    
			 x x x x  see single setlists (present, copy, export) 
			 x x x    create and edit setlists                    
			 x x x    custom song tuning in setlists              
			 x x x    synchronize setlists                        
			 x x      create and edit songs                       
			 x x      delete songs and setlists                   
			 x        create, edit and delete song tags           
			 x        create, edit and delete song languages      
			 x        create, edit and delete users               
		*/
		userRoles: () => ({
			reader: 1,
			performer: 2,
			editor: 3,
			admin: 4,
		}),
		// identify chord lines
		isChordLine: isChordLine,
		// parse song content syntax
		parsedContent: (content, tuning, showChords, twoColumns) => {
			// initialize arrays for parsed lines, classes of parts, type abbr., numbers of type and part index
			var parsed = [], classes = [], types = [], numbers = [], part = 0;
			var lines = content.split('\n');
			// check every single line of song content
			for (var i = 0; i < lines.length; i++) {
				var line = lines[i];
				// handle display chord lines
				if (isChordLine(line) && !showChords) {
					// skip chord line if no chords shall be displayed
					continue;
				}
				// handle chord tuning
				if (isChordLine(line) && tuning != 0) {
					// build new line by handling the current over- or underflow of spaces due to different chord string lenghts
					var newLine = '', spaces = 0, j = 0;
					while (j < line.length) {
						// get single character in line
						var c = line[j];
						// handle over- or underflow of spaces to keep chords on their original position
						if (spaces > 0 && c == ' ') {
							// to few spaces: double next existing space and decrease space count
							c = '  ';
							spaces--;
						}
						if (spaces < 0 && c == ' ' && line[j+1] == ' ') {
							// to many spaces: skip one of two consecutive spaces and increase space count
							spaces++;
							j++;
							continue;
						}
						// on '#': skip to next character as it will be handled together with tune
						if (c == '#') {
							j++;
							continue;
						}
						var isHalf = line[j+1] == '#';
						// check if character is a tune with '#'
						if (isHalf) {
							c = c + '#';
						}
						// check if character is a transposable character
						if (keyScale().indexOf(c) > -1) {
							// replace character by next tune character
							var nextTune = keyScale()[(12 + keyScale().indexOf(c) + (tuning % 12)) % 12];
							newLine += nextTune;
							// update over- or underflow of spaces
							spaces += c.length - nextTune.length;
						} else {
							newLine += c;
						}
						j++;
					}
					// make sure that last two characters stay spaces for chord line identification (rtrim and add 2 spaces)
					newLine = newLine.replace(/\s+$/, '') + '  ';
					// add lines to new content
					if (!parsed[part]) {
						parsed[part] = [];
					}
					parsed[part].push(newLine);
					continue;
				}
				// handle normal song line
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
				// handle song part marker (e.g. --V1)
				else {
					// add class to part
					switch (line.charAt(2).toLowerCase()) {
						case 'v':
							types.push('v');
							classes.push('verse ' + ((!isNaN(parseInt(line.trim().charAt(3)))) ? 'part' + line.trim().charAt(3) : ''));
							numbers.push((!isNaN(parseInt(line.trim().charAt(3)))) ? line.trim().charAt(3) : '0');
							break;
						case 'p':
							types.push('p');
							classes.push('prechorus');
							numbers.push((!isNaN(parseInt(line.trim().charAt(3)))) ? line.trim().charAt(3) : '0');
							break;
						case 'c':
							types.push('c');
							classes.push('chorus');
							numbers.push((!isNaN(parseInt(line.trim().charAt(3)))) ? line.trim().charAt(3) : '0');
							break;
						case 'b':
							types.push('b');
							classes.push('bridge');
							numbers.push((!isNaN(parseInt(line.trim().charAt(3)))) ? line.trim().charAt(3) : '0');
							break;
						case 'i':
							types.push('i');
							classes.push('intro');
							numbers.push((!isNaN(parseInt(line.trim().charAt(3)))) ? line.trim().charAt(3) : '0');
							break;
						case 'm':
							types.push('m');
							classes.push('mitro');
							numbers.push((!isNaN(parseInt(line.trim().charAt(3)))) ? line.trim().charAt(3) : '0');
							break;
						case 'o':
							types.push('o');
							classes.push('outro');
							numbers.push((!isNaN(parseInt(line.trim().charAt(3)))) ? line.trim().charAt(3) : '0');
							break;
						default:
							// a non existent part tag was found
							break;
					}
					// consider next part
					part++;
				}
			}
			var newContent = [];
			// if multiple parts: rejoin lines of every part
			if (parsed.length > 1) {
				for (var p = 1; p < parsed.length; p++) {
					// skip parts that don't exist (e.g. chords only parts with chords disabled)
					if (!parsed[p]) continue;
					// add song part
					newContent.push({
						type: types[p-1],
						number: numbers[p-1],
						class: classes[p-1],
						content: parsed[p].join('\n')
					});
				}
			}
			// if no parts (no markers set): take whole content as one unclassified part
			else {
				newContent.push({
					type: '',
					number: 0,
					class: '',
					content: content
				});
			}
			if (twoColumns) {
				// split content into two columns and return
				let half = Math.ceil(newContent.length / 2);
				return [newContent.slice(0, half), newContent.slice(half, newContent.length)];
			} else {
				return newContent;
			}
		},
		// file download
		download: (data, filename) => {
			var a = document.createElement('a');
			var file = new Blob([data], { type:'text/plain;charset=UTF-8' });
			// IE10+
			if (window.navigator.msSaveOrOpenBlob) {
				window.navigator.msSaveOrOpenBlob(file, filename);
			}
			// other browsers
			else {
				var url = URL.createObjectURL(file);
				a.href = url;
				a.download = filename;
				document.body.appendChild(a);
				a.click();
				setTimeout(() => {
					document.body.removeChild(a);
					window.URL.revokeObjectURL(url);
				}, 0);
			}
		},
		// format human readable date
		humanDate: (d, locale, showWeekdate=true) => {
			if (!d) return '';
			let options = showWeekdate
				? { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
				: { year: 'numeric', month: 'long', day: 'numeric' };
			return (new Date(d)).toLocaleDateString(locale + '-' + locale.toUpperCase(), options);
		},
		// format human readable file sizes
		// https://stackoverflow.com/questions/10420352/converting-file-size-in-bytes-to-human-readable-string#14919494
		humanFileSize: (bytes, si=false, dp=1) => {
			const thresh = si ? 1000 : 1024;
			if (Math.abs(bytes) < thresh) {
				return bytes + ' B';
			}
			const units = si 
				? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'] 
				: ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
			let u = -1;
			const r = 10**dp;
			do {
				bytes /= thresh;
				++u;
			} while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);
			return bytes.toFixed(dp) + ' ' + units[u];
		},
		// highlight given text in SongDrive syntax highlighting
		sdHighlight: (code) => {
			let parsedCode = [];
			code.split('\n').forEach(line => {
				// check for marker
				if (line.substring(0,2) === '--') {
					parsedCode.push('<span class="text-gray">' + line + '</span>');
				} else
				// check for chords
				if (line.slice(-2) === '  ') {
					parsedCode.push('<span class="text-primary">' + line + '</span>');
				}
				// lyrics
				else {
					parsedCode.push(line);
				}
			});
			return parsedCode.join('\n');
		},
		// calculate initials for given user name
		initials: (userName) => {
			return userName
				? userName.trim().split(' ', 2).reduce((p, c) => p + c.charAt(0), '').toUpperCase()
				: ''
		},
		// toast error message
		throwError: (error) => {
			Notifications.notify({
				title: error.code,
				text: error.message,
				type: 'error'
			});
		},
		// calculate example password
		examplePassword: (length) => {
			let pass = '', rdm62;
			while (length--) {
			 // Generate random integer between 0 and 61, 0|x works for Math.floor(x) in this case 
			 rdm62 = 0 | Math.random() * 62; 
			 // Map to ascii codes: 0-9 to 48-57 (0-9), 10-35 to 65-90 (A-Z), 36-61 to 97-122 (a-z)
			 pass += String.fromCharCode(rdm62 + (rdm62 < 10 ? 48 : rdm62 < 36 ? 55 : 61)) 
			}
			return pass;
		},
		// make a given string url friendly
		urlify: (s) => {
			return s.trim().toLowerCase()
				.replace(/\s/g, '-')
				.replace(/\//g, '-')
				.replace(/\_/g, '-')
				.replace(/'/g, '')
				.replace(/"/g, '')
				.replace(/,/g, '')
				.replace(/;/g, '')
				.replace(/\./g, '')
				.replace(/:/g, '')
				.replace(/#/g, '')
				.replace(/ä/g, 'ae')
				.replace(/ö/g, 'oe')
				.replace(/ü/g, 'ue')
				.replace(/ß/g, 'ss')
				.replace(/²/g, '2')
				.replace(/³/g, '3');
		}
  }
})

// extend Object for filtering
Object.filter = (obj, predicate) => 
	Object.keys(obj)
		.filter(key => predicate(obj[key]))
		.reduce((res, key) => (res[key] = obj[key], res), {});

// ready? let's go!
app.mount('#app');
