// basic program parameters
export default {
	// scale to use for song tuning and transponation
	tunes: ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'B', 'H'],
	// user roles and permissions: Reader, Performer, Editor and Administrator
	/*
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
	// identify chord lines
	isChordLine(line) {
		if (line == '') return false
		return line.slice(-2) === '  '
	},
}
