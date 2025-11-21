<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { amberClient, type AmberCollection, type AmberCollections, type UserInfo, type UserInTenant } from 'amber-client'
import type { SetlistEntity, Setlist, SongEntity, Song } from '../../backend/models.js';

var tenant = ref('default');

var isConnected = ref(false);

// make sure to use the same `path` as on the server side
// If you do not include the tenant, the user will be prompted with the selection of tenant that are available to this user
var client = amberClient()
	.withPath('/amber')
	.withTenant(tenant.value)
	.withAmberUiLogin()
	.start();

// you should now wait until you have a valid user logged in to the tenant.
// This will happen automatically since the user will be forwarded to a login page and redirected back once he or she is logged in.
var user = ref<UserInTenant | null>(null);

var songs = ref<Song[]>([]);
var setlists = ref<Setlist[]>([]);
const users = ref<{[key:string]: UserInfo}>({}); // { user id: user info object }

const setlistTitle = ref('');

var collectionApi: AmberCollections | null;

var songsCollection: AmberCollection<SongEntity> | null = null;
var setlistCollection: AmberCollection<SetlistEntity> | null = null;

const songIndex = computed<{[key:string]: Song}>(() => songs.value.reduce((p, c) => ({ ...p, [c.id]: c}), {})  || {});

onMounted(async () => {
	user.value = await client.userInTenant();
	collectionApi = client.getCollectionsApi();
	songsCollection = collectionApi.getCollection<SongEntity>('songs');
	setlistCollection = collectionApi.getCollection<SetlistEntity>('setlists');

	songsCollection.subscribe(0, (doc) => {
		let existing = songs.value.find(s => s.id === doc.id);
		if (existing) {
			existing.entity = doc.data;
			existing.changeNumber = doc.change_number;
		} else {
			songs.value.push({ id: doc.id, entity: doc.data, changeNumber: doc.change_number });
		}

	}, (docDeletedId) => {
		songs.value = songs.value.filter(s => s.id !== docDeletedId);
	});

	setlistCollection.subscribe(0, (doc) => {
		let existing = setlists.value.find(s => s.id === doc.id);
		if (existing) {
			existing.entity = doc.data;
			existing.changeNumber = doc.change_number;
		} else {
			setlists.value.push({ id: doc.id, entity: doc.data, changeNumber: doc.change_number });
		}

	}, (docDeletedId) => {
		setlists.value = setlists.value.filter(s => s.id !== docDeletedId);
	});

	await collectionApi.connect();
	collectionApi.onConnectionChanged((connected) => {
		isConnected.value = connected;
	});

	const usersResponse = await client.getAmberApi()?.getUsers();
	users.value = usersResponse?.reduce((p, c) => ({ ...p, [c.id]: c}), {})  || {};
});

async function addSong() {
	await songsCollection?.createDoc({
		createdBy: user.value!.user.id,
		title: Math.random().toString(36).substring(2, 7),
		content: 'Lyrics go here',
		authors: 'A | B',
		language: 'en',
		publisher: 'unknonw',
		slug: 'abcde',
		tags: [],
		translations: [],
	});
}

async function addSetlist() {
	await setlistCollection?.createDoc({
		createdBy: user.value!.user.id,
		title: Math.random().toString(36).substring(2, 7),
		songs: songs.value.map((s: Song) => ({id: s.id, key: 'A'})),
		sharedWith: [],
		isPublic: true,
		date: '2026-01-01',
	});
}

async function editSetlist(setlist: Setlist) {
	const content = setlist.entity;
	content.title = setlistTitle.value;
	await setlistCollection?.updateDoc(setlist.id, setlist.changeNumber as number, content);
	setlistTitle.value = '';
}

</script>

<template>
	Logged in user: {{ user?.user.name }} ({{ user?.user.email }})<br>
	Roles: {{ user?.roles.join(', ') }}<br>
	Tenant: {{ tenant }} ({{ isConnected ? 'connected' : 'not connected' }})
	<template v-if="user?.roles.includes('admin')">
		<button @click="client.getAmberUiApi().goToGlobalAdmin()">Manage</button>
	</template>
	<h2>Songs</h2>
	<ul>
		<li v-for="song in songs" :key="song.id">
			<strong>{{ song.entity.title }}</strong> by {{ users[song.entity.createdBy]?.name }}
		</li>
	</ul>
	<button @click="addSong()">Add Song</button>

	<h2>Setlists</h2>
	<p>Edit title: <input type="text" v-model="setlistTitle" /></p>
	<ul>
		<li v-for="setlist in setlists" :key="setlist.id">
			<strong>{{ setlist.entity.title }}</strong> by {{ users[setlist.entity.createdBy]?.name }}
			({{ setlist.entity.songs.length }} songs)
			<a href="#" @click.prevent="editSetlist(setlist)">Save</a>
		</li>
	</ul>
	<button @click="addSetlist()">Add Setlist</button>

	<hr>
	<div v-if="setlists.length > 4">
		Last Setlist:<br>
		{{ setlists[4].entity.title }}<br>
		Songs:
		<ol>
			<li v-for="song in setlists[4].entity.songs">{{ songIndex[song.id].entity.title }}</li>
		</ol>
	</div>
</template>
