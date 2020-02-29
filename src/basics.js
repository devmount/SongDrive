// basic program parameters
export default {
	
	/*
	 * scale to use for song tuning and transponation
	 */
	tunes: ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'B', 'H'],
	
	/*
	 * temporary language list - shall be managed by admins in future
	 */
	languages: {
		de: 'Deutsch',
		en: 'English',
		fr: 'Français',
		li: 'Lingala',
	},
	
	/*
		user roles and permissions: Reader, Performer, Editor and Administrator

		RPEA
		XXXX see dashboard, song list and setlist list
		XXXX open single songs (present, tune, export)
		XXXX open single setlists (present, copy, export)
		-XXX create and edit setlists
		-XXX custom tuning in setlists
		-XXX sync setlists
		--XX create and edit songs
		--XX delete songs and setlists
		---X create, edit and delete tags
		---X create, edit and delete users
	*/
	roles: { reader: 1, performer: 2, editor: 3, admin: 4 },

	/*
	 * identify chord lines
	 */
	isChordLine(line) {
		if (line == '') return false
		return line.slice(-2) === '  '
	},
	
	/*
	 * parse song content syntax
	 */
	parsedContent (content, tuning, showChords, twoColumns) {
		// initialize arrays for parsed lines, classes of parts, type abbr., numbers of type and part index
		var parsed = [], classes = [], types = [], numbers = [], part = 0
		var lines = content.split('\n')
		// check every single line of song content
		for (var i = 0; i < lines.length; i++) {
			var line = lines[i]
			// handle display chord lines
			if (this.isChordLine(line) && !showChords) {
				// skip chord line if no chords shall be displayed
				continue
			}
			// handle chord tuning
			if (this.isChordLine(line) && tuning != 0) {
				// init the new line to build and the current over- or underflow of spaces due to different chord string lenghts
				var newLine = '', spaces = 0, j = 0
				while (j < line.length) {
					// get single character in line
					var c = line[j]
					// handle over- or underflow of spaces to keep chords on their original position
					if (spaces > 0 && c == ' ') {
						// to few spaces: double next existing space and decrease space count
						c = '  '
						spaces--
					}
					if (spaces < 0 && c == ' ' && line[j+1] == ' ') {
						// to many spaces: skip one of two consecutive spaces and increase space count
						spaces++
						j++
						continue
					}
					// on '#': skip to next character as it will be handled together with tune
					if (c == '#') {
						j++
						continue
					}
					var isHalf = line[j+1] == '#'
					// check if character is a tune with '#'
					if (isHalf) {
						c = c + '#'
					}
					// check if character is a transposable character
					if (this.tunes.indexOf(c) > -1) {
						// replace character by next tune character
						var nextTune = this.tunes[(12 + this.tunes.indexOf(c) + (tuning % 12)) % 12]
						newLine += nextTune
						// update over- or underflow of spaces
						spaces += c.length - nextTune.length
					} else {
						newLine += c
					}
					j++
				}
				// make sure that last two characters stay spaces for chord line identification (rtrim and add 2 spaces)
				newLine = newLine.replace(/\s+$/, '') + '  '
				// add lines to new content
				if (!parsed[part]) {
					parsed[part] = []
				}
				parsed[part].push(newLine)
				continue
			}
			// handle normal song line
			if (line.trim().indexOf('--') < 0) {
				// only consider line if not empty
				if (line.trim() != '') {
					if (!parsed[part]) {
						parsed[part] = []
					}
					// add line to current part
					parsed[part].push(line)
				}
			}
			// handle song part marker (e.g. --V1)
			else {
				// add class to part
				switch (line.charAt(2).toLowerCase()) {
					case 'v':
						types.push('v')
						classes.push('verse ' + ((!isNaN(parseInt(line.trim().charAt(3)))) ? 'part' + line.trim().charAt(3) : ''))
						numbers.push((!isNaN(parseInt(line.trim().charAt(3)))) ? line.trim().charAt(3) : '0'); break
					case 'p':
						types.push('p')
						classes.push('prechorus')
						numbers.push((!isNaN(parseInt(line.trim().charAt(3)))) ? line.trim().charAt(3) : '0'); break
					case 'c':
						types.push('c')
						classes.push('chorus')
						numbers.push((!isNaN(parseInt(line.trim().charAt(3)))) ? line.trim().charAt(3) : '0'); break
					case 'b':
						types.push('b')
						classes.push('bridge')
						numbers.push((!isNaN(parseInt(line.trim().charAt(3)))) ? line.trim().charAt(3) : '0'); break
					case 'i':
						types.push('i')
						classes.push('intro')
						numbers.push((!isNaN(parseInt(line.trim().charAt(3)))) ? line.trim().charAt(3) : '0'); break
					case 'm':
						types.push('m')
						classes.push('mitro')
						numbers.push((!isNaN(parseInt(line.trim().charAt(3)))) ? line.trim().charAt(3) : '0'); break
					case 'o':
						types.push('o')
						classes.push('outro')
						numbers.push((!isNaN(parseInt(line.trim().charAt(3)))) ? line.trim().charAt(3) : '0'); break
					default:
						// a non existent part tag was found
				}
				// consider next part
				part++
			}
		}
		var newContent = []
		// if multiple parts: rejoin lines of every part
		if (parsed.length > 1) {
			for (var p = 1; p < parsed.length; p++) {
				newContent.push({
					type: types[p-1],
					number: numbers[p-1],
					class: classes[p-1],
					content: parsed[p].join('\n')
				})
			}
		}
		// if no parts (no markers set): take whole content as one unclassified part
		else {
			newContent.push({
				type: '',
				number: 0,
				class: '',
				content: content
			})
		}
		if (twoColumns) {
			// split content into two columns and return
			let half = Math.ceil(newContent.length / 2)
			return [newContent.slice(0, half), newContent.slice(half, newContent.length)]
		} else {
			return newContent
		}
	},

	/*
	 * file download
	 */
	download (data, filename) {
		var a = document.createElement('a')
		var file = new Blob([data], { type:'text/plain;charset=UTF-8' })
		// IE10+
		if (window.navigator.msSaveOrOpenBlob) {
			window.navigator.msSaveOrOpenBlob(file, filename)
		}
		// other browsers
		else {
			var url = URL.createObjectURL(file)
			a.href = url
			a.download = filename
			document.body.appendChild(a)
			a.click()
			setTimeout(function() {
				document.body.removeChild(a)
				window.URL.revokeObjectURL(url)
			}, 0)
		}
	},

	/*
	 * format human readable date
	 */
	humanDate (d, locale) {
		if (!d) return ''
		let options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
		return (new Date(d)).toLocaleDateString(locale + '-' + locale.toUpperCase(), options)
	}

}
