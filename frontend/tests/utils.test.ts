import { describe, expect, it } from 'vitest';
import type { SongEntity } from '@backend/models';
import {
	firstParam,
	humanDate,
	humanFileSize,
	initials,
	isChordLine,
	openLyricsXML,
	parseNumberInput,
	parsedContent,
	sdHighlight,
	sortTags,
	urlify,
} from '@/utils';

describe('isChordLine', () => {
	it('rejects empty and whitespace-only lines', () => {
		expect(isChordLine('')).toBe(false);
		expect(isChordLine('   ')).toBe(false);
	});

	it('recognizes a line ending in exactly two trailing spaces', () => {
		expect(isChordLine('Em  ')).toBe(true);
	});

	it('rejects lines with one or zero trailing spaces', () => {
		expect(isChordLine('Em ')).toBe(false);
		expect(isChordLine('Em')).toBe(false);
	});
});

describe('parsedContent', () => {
	it('treats content with no markers as a single unclassified part', () => {
		const content = 'line1\nline2';
		expect(parsedContent(content, 0, true, false)).toEqual([
			{ type: '', number: 0, class: '', content },
		]);
	});

	it('parses a marker with a numeric suffix', () => {
		expect(parsedContent('--V1\nHello world', 0, true, false)).toEqual([
			{ type: 'v', number: '1', class: 'verse', content: 'Hello world' },
		]);
	});

	it('defaults the number to \'0\' when a marker has no numeric suffix', () => {
		expect(parsedContent('--C\nchorus line', 0, true, false)).toEqual([
			{ type: 'c', number: '0', class: 'chorus', content: 'chorus line' },
		]);
	});

	it('maps every recognized marker letter to its class', () => {
		const content = '--I\nintro\n--V1\nverse one\n--P\nprechorus\n--C\nchorus\n--B\nbridge\n--M\nmitro\n--O\noutro';
		expect(parsedContent(content, 0, true, false)).toEqual([
			{ type: 'i', number: '0', class: 'intro', content: 'intro' },
			{ type: 'v', number: '1', class: 'verse', content: 'verse one' },
			{ type: 'p', number: '0', class: 'prechorus', content: 'prechorus' },
			{ type: 'c', number: '0', class: 'chorus', content: 'chorus' },
			{ type: 'b', number: '0', class: 'bridge', content: 'bridge' },
			{ type: 'm', number: '0', class: 'mitro', content: 'mitro' },
			{ type: 'o', number: '0', class: 'outro', content: 'outro' },
		]);
	});

	it('treats an unrecognized marker as an untyped part without desyncing later parts', () => {
		const content = '--V1\nverse one\n--X\nmiddle\n--C\nchorus';
		expect(parsedContent(content, 0, true, false)).toEqual([
			{ type: 'v', number: '1', class: 'verse', content: 'verse one' },
			{ type: '', number: '0', class: '', content: 'middle' },
			{ type: 'c', number: '0', class: 'chorus', content: 'chorus' },
		]);
	});

	it('drops chord lines when showChords is false', () => {
		const content = '--V1\nEm  \nlyric line';
		expect(parsedContent(content, 0, false, false)).toEqual([
			{ type: 'v', number: '1', class: 'verse', content: 'lyric line' },
		]);
	});

	it('keeps chord lines unchanged when showChords is true and keyOffset is 0', () => {
		const content = '--V1\nEm  \nlyric line';
		expect(parsedContent(content, 0, true, false)).toEqual([
			{ type: 'v', number: '1', class: 'verse', content: 'Em  \nlyric line' },
		]);
	});

	it('transposes a chord line up by the given key offset', () => {
		const content = '--V1\nC  ';
		expect(parsedContent(content, 2, true, false)).toEqual([
			{ type: 'v', number: '1', class: 'verse', content: 'D  ' },
		]);
	});

	it('wraps around the top of the key scale', () => {
		const content = '--V1\nH  ';
		expect(parsedContent(content, 1, true, false)).toEqual([
			{ type: 'v', number: '1', class: 'verse', content: 'C  ' },
		]);
	});

	it('wraps around the bottom of the key scale with a negative offset', () => {
		const content = '--V1\nC  ';
		expect(parsedContent(content, -1, true, false)).toEqual([
			{ type: 'v', number: '1', class: 'verse', content: 'H  ' },
		]);
	});

	it('shrinks a sharp chord to a natural while keeping exactly two trailing spaces', () => {
		const content = '--V1\nC#  ';
		expect(parsedContent(content, 1, true, false)).toEqual([
			{ type: 'v', number: '1', class: 'verse', content: 'D  ' },
		]);
	});

	it('splits parts into two columns', () => {
		const content = '--V1\none\n--V2\ntwo\n--V3\nthree';
		expect(parsedContent(content, 0, true, true)).toEqual([
			[
				{ type: 'v', number: '1', class: 'verse', content: 'one' },
				{ type: 'v', number: '2', class: 'verse', content: 'two' },
			],
			[
				{ type: 'v', number: '3', class: 'verse', content: 'three' },
			],
		]);
	});
});

describe('humanDate', () => {
	it('returns an empty string for null/undefined', () => {
		expect(humanDate(null, 'en')).toBe('');
		expect(humanDate(undefined, 'en')).toBe('');
	});

	it('formats with weekday by default', () => {
		expect(humanDate('2026-03-05', 'en')).toBe('Thursday, March 5, 2026');
	});

	it('formats without weekday when showWeekdate is false', () => {
		expect(humanDate('2026-03-05', 'en', false)).toBe('March 5, 2026');
	});

	it('formats short form without weekday', () => {
		expect(humanDate('2026-03-05', 'en', false, true)).toBe('3/5/26');
	});
});

describe('humanFileSize', () => {
	it('uses a plain byte suffix below the threshold', () => {
		expect(humanFileSize(500)).toBe('500 B');
		expect(humanFileSize(999, true)).toBe('999 B');
	});

	it('uses binary units by default', () => {
		expect(humanFileSize(1024)).toBe('1.0 KiB');
	});

	it('uses SI units when si is true', () => {
		expect(humanFileSize(1000, true)).toBe('1.0 kB');
	});

	it('respects the decimal places argument', () => {
		expect(humanFileSize(1536, false, 0)).toBe('2 KiB');
		expect(humanFileSize(1536, false, 2)).toBe('1.50 KiB');
	});
});

describe('sdHighlight', () => {
	it('wraps a marker line', () => {
		expect(sdHighlight('--V1')).toBe('<span class="sd-marker">--V1</span>');
	});

	it('wraps a chord line', () => {
		expect(sdHighlight('Em  ')).toBe('<span class="sd-chords">Em  </span>');
	});

	it('leaves a plain lyric line unwrapped', () => {
		expect(sdHighlight('Amazing grace')).toBe('Amazing grace');
	});

	it('handles multiple lines independently', () => {
		expect(sdHighlight('--V1\nEm  \nlyrics')).toBe(
			'<span class="sd-marker">--V1</span>\n<span class="sd-chords">Em  </span>\nlyrics'
		);
	});
});

describe('initials', () => {
	it('takes the first letter of the first two words', () => {
		expect(initials('Jane Doe')).toBe('JD');
	});

	it('handles a single-word name', () => {
		expect(initials('Cher')).toBe('C');
	});

	it('returns an empty string when no name is given', () => {
		expect(initials(undefined)).toBe('');
	});
});

describe('urlify', () => {
	it('replaces spaces, slashes and underscores with hyphens', () => {
		expect(urlify('Foo Bar/Baz_Qux')).toBe('foo-bar-baz-qux');
	});

	it('strips quotes and punctuation', () => {
		expect(urlify(`It's "Great", Really; Truly.: Yes#`)).toBe('its-great-really-truly-yes');
	});

	it('transliterates German umlauts, ß and superscripts', () => {
		expect(urlify('Größe Straße m² m³')).toBe('groesse-strasse-m2-m3');
	});

	it('trims and lowercases the input', () => {
		expect(urlify('  Already-Fine  ')).toBe('already-fine');
	});
});

describe('parseNumberInput', () => {
	it('treats an empty string as unset', () => {
		expect(parseNumberInput('')).toBeUndefined();
	});

	it('parses a numeric string', () => {
		expect(parseNumberInput('42')).toBe(42);
	});

	it('trims a trailing space before parsing', () => {
		expect(parseNumberInput('12345 ')).toBe(12345);
	});

	it('trims a leading space before parsing', () => {
		expect(parseNumberInput(' 12345')).toBe(12345);
	});

	it('treats a whitespace-only string as unset', () => {
		expect(parseNumberInput('   ')).toBeUndefined();
	});
});

describe('sortTags', () => {
	it('sorts by translated name, not raw key', () => {
		// en: worship -> Worship, grace -> Grace, joy -> Joy
		expect(sortTags(['worship', 'grace', 'joy'], 'en')).toEqual(['grace', 'joy', 'worship']);
	});

	it('sorts differently per locale', () => {
		// de: worship -> Anbetung, grace -> Gnade, joy -> Freude
		expect(sortTags(['worship', 'grace', 'joy'], 'de')).toEqual(['worship', 'joy', 'grace']);
	});

	it('falls back to the raw key for untranslated tags', () => {
		expect(sortTags(['zzz-unknown', 'aaa-unknown'], 'en')).toEqual(['aaa-unknown', 'zzz-unknown']);
		expect(sortTags(['worship', 'aaa-unknown'], 'en')).toEqual(['aaa-unknown', 'worship']);
	});
});

describe('firstParam', () => {
	it('returns the first element of an array', () => {
		expect(firstParam(['a', 'b'])).toBe('a');
	});

	it('returns a plain string unchanged', () => {
		expect(firstParam('a')).toBe('a');
	});

	it('returns undefined unchanged', () => {
		expect(firstParam(undefined)).toBeUndefined();
	});
});

describe('openLyricsXML', () => {
	const minimalSong: SongEntity = {
		authors: [],
		content: 'Hello',
		createdBy: 'u',
		language: 'en',
		publisher: '',
		slug: 's',
		tags: [],
		title: 'My Song',
		translations: [],
	};

	it('omits optional elements that have no data', () => {
		const xml = openLyricsXML(minimalSong, '1.0.0');
		expect(xml).toContain('<title>My Song</title>');
		expect(xml).not.toContain('<released>');
		expect(xml).not.toContain('<ccliNo>');
		expect(xml).not.toContain('<copyright>');
		expect(xml).toContain('<authors></authors>');
		expect(xml).toContain('<themes></themes>');
		expect(xml).toContain('<verse name=\'V1\'><lines>Hello</lines></verse>');
	});

	it('includes optional elements when present, escaping the copyright text', () => {
		const song: SongEntity = {
			authors: ['Alice', 'Bob'],
			ccli: 12345,
			content: '--V1\nLine one',
			createdBy: 'u',
			language: 'en',
			publisher: 'Pub & Co\nSecond line',
			slug: 's2',
			subtitle: 'A Subtitle',
			tags: ['worship'],
			title: 'Full Song',
			translations: [],
			year: 2020,
		};
		const xml = openLyricsXML(song, '1.0.0');
		expect(xml).toContain('<title>Full Song</title><title>A Subtitle</title>');
		expect(xml).toContain('<released>2020</released>');
		expect(xml).toContain('<copyright>2020 Pub &amp; Co; Second line</copyright>');
		expect(xml).toContain('<ccliNo>12345</ccliNo>');
		expect(xml).toContain('<authors><author>Alice</author><author>Bob</author></authors>');
		expect(xml).toContain('<theme lang=\'de\'>Anbetung</theme>');
		expect(xml).toContain('<theme lang=\'en\'>Worship</theme>');
		expect(xml).toContain('<verse name=\'V1\'><lines>Line one</lines></verse>');
	});

	it('includes translation markup and interleaved content when translatedSong is given', () => {
		const song: SongEntity = { ...minimalSong, content: '--V1\nOriginal line' };
		const translatedSong: SongEntity = { ...minimalSong, content: '--V1\nTranslated line' };
		const xml = openLyricsXML(song, '1.0.0', translatedSong);
		expect(xml).toContain('<format><tags application=\'OpenLP\'>');
		expect(xml).toContain(
			'<verse name=\'V1\'><lines>Original line<br/><br/><tag name=\'it\'><tag name=\'gr\'><tag name=\'fd\'>Translated line</tag></tag></tag></lines></verse>'
		);
	});
});
