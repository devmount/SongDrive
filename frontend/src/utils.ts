import { notify } from '@kyvg/vue3-notification';
import type { AmberCollection } from 'amber-client';
import type { Song, SongEntity } from '@backend/models';
import de from '@/locales/de.json';
import en from '@/locales/en.json';

// tag translations per locale, keyed by locale code
const tagTranslations: Record<string, Record<string, string>> = { de: de.tag, en: en.tag };

// scale to use for song tuning and transponation
const keyScale = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'B', 'H'];

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
const userRoles: Record<string, number> = {
  reader:    1,
  performer: 2,
  editor:    3,
  admin:     4,
};

// identify chord lines
const isChordLine = (line: string): boolean => {
	if (line.trim() == '') return false;
	return line.slice(-2) === '  ';
};

// a single parsed part of a song's content (verse, chorus, ...)
export type SongPart = {
  type: string;
  number: number | string;
  class: string;
  content: string;
};

// parse song content syntax
function parsedContent(content: string, keyOffset: number, showChords: boolean, twoColumns: false): SongPart[];
function parsedContent(content: string, keyOffset: number, showChords: boolean, twoColumns: true): [SongPart[], SongPart[]];
function parsedContent(content: string, keyOffset: number, showChords: boolean, twoColumns: boolean): SongPart[] | [SongPart[], SongPart[]] {
  // initialize arrays for parsed lines, classes of parts, type abbr., numbers of type and part index
  var parsed: string[][] = [], classes: string[] = [], types: string[] = [], numbers: (number | string)[] = [], part = 0;
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
    if (isChordLine(line) && keyOffset != 0) {
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
        if (keyScale.indexOf(c) > -1) {
          // replace character by next tune character
          var nextTune = keyScale[(12 + keyScale.indexOf(c) + (keyOffset % 12)) % 12];
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
			const n = line.trim().substring(3);
      // add class to part
      switch (line.charAt(2).toLowerCase()) {
        case 'v':
          types.push('v');
          classes.push('verse');
          numbers.push((!isNaN(parseInt(n))) ? n : '0');
          break;
        case 'p':
          types.push('p');
          classes.push('prechorus');
          numbers.push((!isNaN(parseInt(n))) ? n : '0');
          break;
        case 'c':
          types.push('c');
          classes.push('chorus');
          numbers.push((!isNaN(parseInt(n))) ? n : '0');
          break;
        case 'b':
          types.push('b');
          classes.push('bridge');
          numbers.push((!isNaN(parseInt(n))) ? n : '0');
          break;
        case 'i':
          types.push('i');
          classes.push('intro');
          numbers.push((!isNaN(parseInt(n))) ? n : '0');
          break;
        case 'm':
          types.push('m');
          classes.push('mitro');
          numbers.push((!isNaN(parseInt(n))) ? n : '0');
          break;
        case 'o':
          types.push('o');
          classes.push('outro');
          numbers.push((!isNaN(parseInt(n))) ? n : '0');
          break;
        default:
          // a non existent part tag was found
          break;
      }
      // consider next part
      part++;
    }
  }
  var newContent: SongPart[] = [];
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
};

// file download
const download = (data: string | Blob, filename: string, isBlob = false): void => {
  var a = document.createElement('a');
  var file = isBlob ? data as Blob : new Blob([data as string], { type:'text/plain;charset=UTF-8' });
  // IE10+
  if ((window.navigator as Navigator & { msSaveOrOpenBlob?: (blob: Blob, filename: string) => void }).msSaveOrOpenBlob) {
    (window.navigator as Navigator & { msSaveOrOpenBlob?: (blob: Blob, filename: string) => void }).msSaveOrOpenBlob!(file, filename);
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
};

// format human readable date
const humanDate = (d: string | Date | null | undefined, locale: string, showWeekdate = true, short = false): string => {
  if (!d) return '';
  let options: Intl.DateTimeFormatOptions = showWeekdate
    ? { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
    : { year: short ? '2-digit' : 'numeric', month: short ? 'numeric' : 'long', day: 'numeric' };
  return (new Date(d)).toLocaleDateString(locale, options);
};

// format human readable file sizes
// https://stackoverflow.com/questions/10420352/converting-file-size-in-bytes-to-human-readable-string#14919494
const humanFileSize = (bytes: number, si = false, dp = 1): string => {
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
};

// highlight given text in SongDrive syntax highlighting
const sdHighlight = (code: string): string => {
  let parsedCode: string[] = [];
  code.split('\n').forEach(line => {
    // check for marker
    if (line.substring(0,2) === '--') {
      parsedCode.push('<span class="sd-marker">' + line + '</span>');
    } else
    // check for chords
    if (line.slice(-2) === '  ') {
      parsedCode.push('<span class="sd-chords">' + line + '</span>');
    }
    // lyrics
    else {
      parsedCode.push(line);
    }
  });
  return parsedCode.join('\n');
};

// calculate initials for given user name
const initials = (userName?: string): string => {
  return userName
    ? userName.trim().split(' ', 2).reduce((p, c) => p + c.charAt(0), '').toUpperCase()
    : ''
};

// toast error message
export type ThrowableError = { code?: string; errorCode?: string; message?: string; error?: string };
const throwError = (error: ThrowableError): void => {
  notify({
    title: error.code ?? error.errorCode,
    text: error.message ?? error.error,
    type: 'error'
  });
};

// calculate random string e.g. as example password
const randomString = (length: number): string => {
  let pass = '', rdm62;
  while (length--) {
   // Generate random integer between 0 and 61, 0|x works for Math.floor(x) in this case
   rdm62 = 0 | Math.random() * 62;
   // Map to ascii codes: 0-9 to 48-57 (0-9), 10-35 to 65-90 (A-Z), 36-61 to 97-122 (a-z)
   pass += String.fromCharCode(rdm62 + (rdm62 < 10 ? 48 : rdm62 < 36 ? 55 : 61))
  }
  return pass;
};

// make a given string url friendly
const urlify = (s: string): string => {
  return s.trim().toLowerCase()
    .replace(/\s/g, '-')
    .replace(/\//g, '-')
    .replace(/_/g, '-')
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

// get the first key of given object that points to given value
const keyByValue = (o: Record<string, unknown>, v: unknown): string | undefined => Object.keys(o).find(k => o[k]===v);

// sort tag keys by their translated name in the given locale
const sortTags = (tags: string[], locale: string): string[] => {
  const translations = tagTranslations[locale];
  return tags.toSorted(
    (a, b) => (translations?.[a] ?? a).localeCompare(translations?.[b] ?? b)
  );
};

// true if browser uses a dark color scheme
const browserPrefersDark = (): boolean => {
  return localStorage.theme === 'dark' || (
    (!('theme' in localStorage) || localStorage.theme === 'auto')
    && window.matchMedia('(prefers-color-scheme: dark)').matches
  );
};

// trigger mailto
const mailto = (address: string): void => { window.location.href = 'mailto:' + address; };

// vue-router route params can be a repeated segment (string[]); none of this
// app's routes use repeatable segments, so always take the first/only value
const firstParam = (v: string | string[] | undefined): string | undefined => Array.isArray(v) ? v[0] : v;

// overwrite one target song's translations array via songsCollection,
// preserving all its other fields (Amberbase updateDoc replaces the whole
// document body, so the full current entity must be read and spread first)
const updateSongTranslations = async (
  songsCollection: AmberCollection<SongEntity>,
  songs: Song[],
  targetId: string,
  transformFn: (translations: string[]) => string[],
): Promise<void> => {
  const target = songs.find(s => s.id === targetId);
  if (!target || target.changeNumber === undefined) return; // stale/unknown local reference - skip rather than throw
  await songsCollection.updateDoc(targetId, target.changeNumber, {
    ...target.entity,
    translations: transformFn(target.entity.translations ?? []),
  });
};

// build OpenLyrics XML for given song
// see https://manual.openlp.org/display_tags.html#configuring-formatting-tags
const openLyricsXML = (song: SongEntity, version: string, translatedSong: SongEntity | null = null): string => {
	const timestamp = (new Date()).toISOString().slice(0, -5);
	const title = `<title>${song.title}</title>`;
	const subtitle = song.subtitle ? `<title>${song.subtitle}</title>` : '';
	const year = song.year ? `<released>${song.year}</released>` : '';
	const copyright = song.year || song.publisher
		? '<copyright>' + song.year + ' ' + song.publisher.replace(/(?:\r\n|\r|\n)/g, '; ').replace(/&/gi, '&amp;') + '</copyright>'
		: '';
	const ccli = song.ccli ? `<ccliNo>${song.ccli}</ccliNo>` : '';
	const authors = song.authors
		? '<authors>' + song.authors.map(a => `<author>${a.trim()}</author>`).join('') + '</authors>'
		: '';
	const tags = song.tags
		? '<themes>' + song.tags.map(
				tag => Object.keys(tagTranslations).map(l =>`<theme lang='${l}'>${tagTranslations[l][tag] ?? tag}</theme>`).join('')
			).join('') + '</themes>'
		: '';
  const format = translatedSong
    ? `<format><tags application='OpenLP'><tag name='it'><open><![CDATA[<em>]]></open><close><![CDATA[</em>]]></close><hidden><![CDATA[False]]></hidden></tag><tag name='gr'><open><![CDATA[<span style='-webkit-text-fill-color:grey'>]]></open><close><![CDATA[</span>]]></close><hidden><![CDATA[True]]></hidden></tag><tag name='fd'><open><![CDATA[<small>]]></open><close><![CDATA[</small>]]></close><hidden><![CDATA[True]]></hidden></tag></tags></format>`
    : '';
  const tParts = translatedSong ? parsedContent(translatedSong.content, 0, false, false) : [];
	const lyrics = parsedContent(song.content, 0, false, false).map((p, i) => {
		const type = p.type ? p.type.toUpperCase() : 'V';
		const num = Number(p.number) > 0 ? p.number : '1';
    const tContent = (i in tParts)
      ? `<br/><br/><tag name='it'><tag name='gr'><tag name='fd'>${tParts[i].content.replace(/\n/g, "<br />")}</tag></tag></tag>`
      : '';
		return `<verse name='${type}${num}'><lines>${p.content.replace(/\n/g, "<br />")}${tContent}</lines></verse>`;
	}).join('');

	return `<?xml version='1.0' encoding='UTF-8'?><song xmlns='http://openlyrics.info/namespace/2009/song' version='0.9' createdIn='SongDrive ${version}' modifiedIn='SongDrive ${version}' modifiedDate='${timestamp}'><properties><titles>${title}${subtitle}</titles>${copyright}${year}${ccli}${authors}${tags}</properties>${format}<lyrics>${lyrics}</lyrics></song>`;
};

export {
  keyScale,
  userRoles,
  isChordLine,
  parsedContent,
  download,
  humanDate,
  humanFileSize,
  sdHighlight,
  initials,
  throwError,
  randomString,
  urlify,
  keyByValue,
  sortTags,
  browserPrefersDark,
  mailto,
  firstParam,
  updateSongTranslations,
  openLyricsXML,
}
