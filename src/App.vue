<template>
	<div id="app">
		<div class="off-canvas off-canvas-sidebar-show">
			<!-- off-screen toggle button -->
			<a class="off-canvas-toggle btn btn-primary btn-action" @click="open = true">
				<i class="icon ion-md-menu"></i>
			</a>

			<!-- off-screen sidebar -->
			<div id="sidebar-id" class="off-canvas-sidebar" :class="{ active: open }">
				<div class="brand text-center mt-2">
					<router-link to="/" class="logo">
						<img src="./assets/logo.svg" alt="SongDrive Song Management Tool">
						<h1>SONGDRIVE</h1>
					</router-link>
				</div>
				<ul class="menu text-uppercase">
					<li class="divider"></li>
					<li class="menu-item">
						<router-link to="/" class="py-2" @click.native="open = false"><i class="icon ion-md-apps mr-2"></i> Dashboard</router-link>
					</li>
					<li class="menu-item">
						<router-link to="/songs" class="py-2" @click.native="open = false"><i class="icon ion-md-musical-notes mr-2"></i> Songs</router-link>
						<div class="menu-badge">
							<label v-if="ready.songs" class="label py-1">{{ songs.length }}</label>
							<label v-else class="label py-1"><div class="loading d-inline-block px-2"></div></label>
							<button class="btn btn-secondary btn-action btn-sm mx-2" @click="modal.addsong = true"><i class="icon ion-md-add"></i></button>
						</div>
					</li>
					<li class="menu-item">
						<router-link to="/setlists" class="py-2" @click.native="open = false"><i class="icon ion-md-list mr-2"></i> Setlists</router-link>
						<div class="menu-badge">
							<label v-if="ready.setlists" class="label py-1">{{ setlists.length }}</label>
							<label v-else class="label py-1"><div class="loading d-inline-block px-2"></div></label>
							<button class="btn btn-secondary btn-action btn-sm mx-2" @click="modal.addsetlist = true"><i class="icon ion-md-add"></i></button>
						</div>
					</li>
					<li class="divider" data-content="ACCOUNT">
					<li class="menu-item pt-2 pb-2">
						<div class="tile tile-centered">
							<div class="tile-icon"><img class="avatar" src="http://media.devmount.de/profile.jpg" alt="Avatar"></div>
							<div class="tile-content">
								Andreas Müller
							</div>
						</div>
					</li>
					<li class="menu-item pt-2">
						<router-link to="/profile" class="py-2" @click.native="open = false"><i class="icon ion-md-person mr-2"></i> Profile</router-link>
					</li>
					<li class="menu-item">
						<router-link to="/settings" class="py-2" @click.native="open = false"><i class="icon ion-md-options mr-2"></i> Settings</router-link>
					</li>
					<li class="menu-item">
						<a href="" class="py-2"><i class="icon ion-md-log-out mr-2"></i> Logout</a>
					</li>
				</ul>
			</div>
			<a class="off-canvas-overlay" @click="open = false"></a>

			<!-- off-screen content -->
			<div class="off-canvas-content">
				<router-view :key="$route.fullPath"></router-view>
			</div>

			<!-- modals -->
			<SongSet :active="modal.addsong" :existing="false" :song="newSong" @closed="modal.addsong = false" @reset="resetSong" />
			<SetlistSet :active="modal.addsetlist" :existing="false" :setlist="newSetlist" @closed="modal.addsetlist = false" @reset="resetSetlist" />
		</div>

		<!-- notifications -->
		<notifications position="bottom right" :duration="5000" classes="toast" />
	</div>
</template>

<script>
// get components
import SongSet from '@/components/SongSet.vue'
import SetlistSet from '@/components/SetlistSet.vue'
// get database object authorized in config.js
import { db } from '@/firebase'

export default {
	name: 'app',
	components: {
		SongSet,
		SetlistSet,
	},
	firestore () {
		return {
			songs: {
				ref: db.collection('songs'),
				resolve: () => { this.ready.songs = true },
				reject: () => { this.ready.songs = true }
			},
			setlists: {
				ref: db.collection('setlists'),
				resolve: () => { this.ready.setlists = true },
				reject: () => { this.ready.setlists = true }
			},
		}
	},
	data () {
		return {
			ready: {
				songs: false,
				setlists: false,
			},
			open: false,
			modal: {
				addsong: false,
				addsetlist: false
			},
			newSong: {
				authors: '',
				ccli: '',
				content: '',
				language: '',
				note: '',
				publisher: '',
				subtitle: '',
				tags: [],
				title: '',
				translations: [],
				tuning: '',
				year: ''
			},
			newSetlist: {
				title: '',
				date: '',
				songs: [],
			}
		}
	},
	methods: {
		resetSong () {
			this.newSong = {
				authors: '',
				ccli: '',
				content: '',
				language: '',
				note: '',
				publisher: '',
				subtitle: '',
				tags: [],
				title: '',
				translations: [],
				tuning: '',
				year: ''
			}
		},
		resetSetlist () {
			this.newSetlist = {
				title: '',
				date: '',
				songs: [],
			}
		},
	}
}
</script>

<style lang="scss">
// import external dependencies
@import url('https://fonts.googleapis.com/css?family=Fira+Mono');

// overwrite spectre variables
$primary-color: #88b544;
$primary-dark-color: #202718;
$error-color: #ed2f47;
$body-font-color: #c1ced1;
$bg-color: #131516;
$bg-color-medium: #181a1b;
$bg-color-light: #1b1e1f;
$bg-color-dark: #293031;
$border-color: #222627;
$gray-color: #5e6769;
$gray-color-dark: #4a5052;
$dark-color: #010101;
$black-color: #000000;
$mono-font-family: "Fira Mono", monospace;
$size-2x: 1440px;

$html-font-size: 20px;
$unit-2: .4rem;
$layout-spacing: $unit-2;
$grid-spacing: ($layout-spacing / ($layout-spacing * 0 + 1)) * $html-font-size;

// import spectre
@import "~spectre.css/src/spectre";
@import "~spectre.css/src/spectre-exp";

// import ionicons
$ionicons-font-path: "~ionicons/dist/fonts";
@import "~ionicons/dist/scss/ionicons";

// icons
.icon {
	font-size: 1em;
}
.icon-4x {
	font-size: 4em;
}

// positions
.m-3 { margin: .6rem !important; }
.mt-3 { margin-top: .6rem !important; }
.mr-3 { margin-right: .6rem !important; }
.mb-3 { margin-bottom: .6rem !important; }
.ml-3 { margin-left: .6rem !important; }
.mx-3 { margin-right: .6rem !important; margin-left: .6rem !important; }
.my-3 { margin-top: .6rem !important; margin-bottom: .6rem !important; }
.p-3 { padding: .6rem !important; }
.pt-3 { padding-top: .6rem !important; }
.pr-3 { padding-right: .6rem !important; }
.pb-3 { padding-bottom: .6rem !important; }
.pl-3 { padding-left: .6rem !important; }
.px-3 { padding-right: .6rem !important; padding-left: .6rem !important; }
.py-3 { padding-top: .6rem !important; padding-bottom: .6rem !important; }
.ls-1 { letter-spacing: 1px; }
.ls-2 { letter-spacing: 2px; }

// responsive grid
.container {
	&.grid-2x {
		max-width: $grid-spacing * 2 + $size-2x;
	}
}
.show-2x {
	display: none !important;
}
@media (max-width: $size-2x) {
	.col-2x-12,
	.col-2x-11,
	.col-2x-10,
	.col-2x-9,
	.col-2x-8,
	.col-2x-7,
	.col-2x-6,
	.col-2x-5,
	.col-2x-4,
	.col-2x-3,
	.col-2x-2,
	.col-2x-1,
	.col-2x-auto {
		flex: none;
	}
	.col-2x-12 {
		width: 100%;
	}
	.col-2x-11 {
		width: 91.66666667%;
	}
	.col-2x-10 {
		width: 83.33333333%;
	}
	.col-2x-9 {
		width: 75%;
	}
	.col-2x-8 {
		width: 66.66666667%;
	}
	.col-2x-7 {
		width: 58.33333333%;
	}
	.col-2x-6 {
		width: 50%;
	}
	.col-2x-5 {
		width: 41.66666667%;
	}
	.col-2x-4 {
		width: 33.33333333%;
	}
	.col-2x-3 {
		width: 25%;
	}
	.col-2x-2 {
		width: 16.66666667%;
	}
	.col-2x-1 {
		width: 8.33333333%;
	}
	.col-2x-auto {
		width: auto;
	}
	.hide-2x {
		display: none !important;
	}
	.show-2x {
		display: block !important;
	}
}

// typography
h1, h2, h3, h4, h5, h6,
.h1, .h2, .h3, .h4, .h5, .h6 {
	text-transform: uppercase;
	font-weight: 300;
}
h2, .h2 {
	font-size: 2.5em;
	letter-spacing: 3px;
	margin-bottom: .2em;

	.loading {
		vertical-align: text-bottom;
	}
}
h3, .h3 {
	font-size: 1em;
	letter-spacing: 2px;
	padding-bottom: 1em;
}
h5, .h5 {
	letter-spacing: 2px;
}
h6, .h6 {
	letter-spacing: 1px;
}
@media (max-width: $size-xl) {
	h2, h3,
	.h2, .h3 {
		text-align: center;
	}
}
.text-pre {
	font-family: $mono-font-family;
}
.text-breaks {
	white-space: pre;
}
.text-small {
	font-size: .8em;
	line-height: 1.1em;
}

// display
.d-flex > * {
	flex: auto;
	flex-basis: 0;
}
.d-flex > * + * {
	margin-left: .2rem;
}
@media (max-width: $size-lg) {
	.d-flex {
		flex-direction: column;
	}
	.d-flex > * {
		margin-left: 0;
	}
}
::selection {
	background: $primary-color;
}
::-moz-selection {
	background: $primary-color;
}

// toast
.notifications {
	margin-right: .8em;
}
.toast {
	margin-bottom: .8em;
}

// form and buttons
.btn {
	&.btn-secondary {
		background: $bg-color-dark;
		border-color: $bg-color-medium;
		color: $gray-color;
		&:focus:not(.btn-error),
		&:hover:not(.btn-error) {
			background: darken($primary-color-dark, 2%);
			border-color: darken($primary-color-dark, 5%);
			color: $light-color;
		}
		&:active:not(.btn-error),
		&.active:not(.btn-error) {
			background: darken($primary-color-dark, 4%);
			border-color: darken($primary-color-dark, 7%);
			color: $light-color;
		}
	}
	&.btn-xl {
		width: 2.5rem;
		height: 2.5rem;
    line-height: 1.9rem;
    font-size: 1.5em;
	}
  &.btn-toggle.btn-primary:focus {
    background: $primary-color;
  }
  &.btn-toggle.btn-secondary:focus {
    background: $bg-color-dark;
  }
	&.stretch {
		width: 100%;
	}
	&.btn-link {
		&.btn-gray {
			color: $gray-color;
		}
	}
}
.switch-lg {
	padding-left: 2.4rem;
	line-height: 1.4rem;

	.form-icon {
		border-radius: 0.55rem;
		height: 1.1rem;
		width: 2rem;

		&::before {
			display: block;
			height: 1rem;
			width: 1rem;
		}
	}
	input:checked + .form-icon::before {
		left: 18px;
	}
}

// chip
.chip {
	height: 1.3rem;

	figure {
		&::before {
			text-transform: uppercase;
		}
	}
}

// tile
.tile {
	figure {
		&::before {
			text-transform: uppercase;
			font-weight: 400;
		}
	}
	& .tile-title,
	& .tile-subtitle {
		line-height: .85rem;
	}
}

// modal
.modal {
	.modal-container {
		.modal-header {
			color: $light-color;

			.modal-subtitle {
				font-weight: 400;
			}
		}
	}
	&.modal-lg {
		.modal-overlay {
			background: rgba($bg-color, .75);
		}
		.modal-container {
			max-width: 100vw;
			max-height: 100vh;
		}

		&.modal-full {
			padding: 0;

			.modal-overlay {
				background: $black-color;
			}
			.modal-container {
				background: $black-color;
				height: 100vh;

				.modal-footer {
					position: absolute;
					bottom: 0;
					right: 0;
				}
			}
		}
	}

	&.modal-secondary {
		.modal-body {
			height: 50vh;
		}
	}
}

// off-canvas
.off-canvas {
	z-index: 0;
	.off-canvas-toggle {
		z-index: 10;
		width: 2.2rem;
	}

	.off-canvas-sidebar {
		min-width: 12rem;
		overflow: visible;
	}
	.off-canvas-content {
		min-height: 100vh;
		padding: 0 !important;
	}
}
@media (max-width: $size-xl) {
	.off-canvas {
		.off-canvas-content {
			padding: .5rem;
		}
	}
}
@media (min-width: $size-lg) {
	.off-canvas {
		.off-canvas-sidebar {
			z-index: 0;

			.tooltip::after {
				display: none;
			}
		}
	}
}
.off-canvas-secondary {
	.off-canvas-sidebar {
		background: $bg-color-medium;
		padding: 1rem;
		min-width: 8.5rem;
		-webkit-box-flex: 0;
		-ms-flex: 0 0 auto;
		flex: 0 0 auto;
		position: relative;
		-webkit-transform: none;
		transform: none;

		.divider {
			margin-top: 2em;
		}
		.divider[data-content]::after {
			background: $bg-color-medium;
		}
	}
}
@media (max-width: $size-lg) {
	.off-canvas-secondary {
		.off-canvas-sidebar {
			padding: 3rem .4rem .4rem .4rem;
			min-width: 2.2rem;
			width: 3rem;

			.btn, .form-switch, .label, .divider {
				max-width: 2.2rem;
			}
			.btn {
				min-height: 2rem;
				line-height: 1.3rem;
			}
		}
	}
}
.container.no-sidebar,
.off-canvas-secondary .off-canvas-content .container {
	padding: 1rem;
}

// branding
.brand {
	padding: 1em 1em 0 1em;

	.logo {
		padding: .3em 0;

		img {
			display: inline-block;
			width: 32px;
		}
		h1 {
			display: inline-block;
			font-size: 1.1rem;
			font-weight: 400;
			letter-spacing: 2px;
			line-height: 1.6rem;
			margin-bottom: 0;
			margin-left: .5rem;
			margin-right: .5rem;
		}
	}
}

// sidebar menu
.menu {
	box-shadow: none;
	background: $bg-color;

	.divider {
		margin-top: 1.1em;
		margin-bottom: 1.1em;

		&[data-content]::after {
			background: $bg-color;
		}
	}

	.menu-item {
		a {
			&:hover {
				background: $primary-dark-color;
			}
			&.text-error:hover {
				background: #27181c;
			}

			&.router-link-exact-active {
				background: $primary-dark-color;
				color: $primary-color;
			}
		}
		.loading {
			&::after {
				border-left-color: white;
				border-bottom-color: white;
			}
		}
		.menu-badge {
			.label {
				vertical-align: middle;
			}
			.btn {
				margin-top: 0;
			}
		}
	}
}

// filter select field
.filter:required:invalid {
	color: $gray-color;
}
.filter option[value=""][disabled] {
	display: none;
}
.filter option {
	color: $body-font-color;
}

// shapes
.s-circle {
	width: 1rem;
	height: 1rem;
	border: 2px solid $gray-color;

	&.active {
		background: $primary-color;
		border-color: $primary-color;
	}
}

// calendar
.calendar {
	width: 100%;
	background: transparent;
	border: none;

	header {
		.prev:after {
			border-right-color: $body-font-color;
		}
		.next:after {
			border-left-color: $body-font-color;
		}

		.prev:not(.disabled):hover, 
		.next:not(.disabled):hover, 
		.up:not(.disabled):hover {
			background: $primary-dark-color;
			color: $primary-color;
		}

		.prev:not(.disabled):hover:after {
			border-right-color: $primary-color;
		}
		.next:not(.disabled):hover:after {
			border-left-color: $primary-color;
		}
	}

	.cell {
		height: 60px;
		line-height: 60px;
		border-radius: 0.1rem;

		&:not(.blank):not(.disabled).day:hover,
		&:not(.blank):not(.disabled).month:hover,
		&:not(.blank):not(.disabled).year:hover {
			border: 1px solid $primary-color;
		}

		&.selected,
		&.selected:hover {
			background: $primary-color;
			font-weight: 900;
		}
	}
}

// slide presentation
.hooper.presentation {
	width: 100%;
	height: 98vh;

	&:focus {
		outline: none;
	}

	.hooper-slide,
	.hooper-slide:focus,
	.hooper-slide:active {
		outline: none;
	}
	
	.hooper-indicator {
		margin: 0 6px;
		width: 1.5em;
		height: 1.5em;
		border-radius: 50%;
		padding: 0;
		background-color: $gray-color-dark;

		&.is-active {
			background-color: $primary-color;
		}

		&:focus {
			outline: none;
		}
	}
}
</style>
