<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { amberClient, AmberClient, type AmberCollection, type AmberCollections, type UserInfo, type UserInTenant } from 'amber-client'
import type { SetlistEntity, Setlist, SongEntity, Song } from '../../backend/models.js';

const tenant = ref('default');
const isConnected = ref(false);

const user = ref<UserInTenant | null>(null);
const client = ref<AmberClient | null>(null);
const authenticated = ref(false);
const authFailed = ref(false);
const authCallback = ref<(record:{email:string, pw:string, stayLoggedIn:boolean}) => void>(()=>{});

const email = ref('');
const password = ref('');
const stayLoggedIn = ref(true);

const songs = ref<Song[]>([]);
const setlists = ref<Setlist[]>([]);
const users = ref<{[key:string]: UserInfo}>({}); // { user id: user info object }

const setlistTitle = ref('');

var collectionApi: AmberCollections | null;

var songsCollection: AmberCollection<SongEntity> | null = null;
var setlistCollection: AmberCollection<SetlistEntity> | null = null;

const songIndex = computed<{[key:string]: Song}>(() => songs.value.reduce((p, c) => ({ ...p, [c.id]: c}), {})  || {});

const init = async () => {
	client.value = amberClient()
		.withPath('/amber')
		.withTenant(tenant.value)
		// .withAmberUiLogin()
		.withCredentialsProvider((failed)=>{
			// wenn `failed` true ist solltest du eine Warnung "Falscher Benutzer oder Passwort" anzeigen. 
			if (failed) {
				authFailed.value = true;
			}

			// zeige das Login-Formular z.B. indem eine vue.js ref auf true gesetzt wird 
			authenticated.value = false;
			
			// die API erwartet jetzt ein Promise dessen `resolve` die Credentials enthält.
			// Dafür machst du einfach ein neues Promise und speicherst dir die callbacks
			// um sie in deinem UI einzubauen
			return new Promise((resolve)=>{
				// loginCallback ist eine variable die das resolve callback deinem UI zur Verfügung stellt. 
				authCallback.value = resolve;
			})
		})
		// .withCleanUser()
		.start();
	
	user.value = await client.value.userInTenant();

	if (authenticated.value) {
		collectionApi = client.value.getCollectionsApi();
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
	
		const usersResponse = await client.value.getAmberApi()?.getUsers();
		users.value = usersResponse?.reduce((p, c) => ({ ...p, [c.id]: c}), {})  || {};
	}
};


const login = () => {
	authenticated.value = true;
	authCallback.value({email: email.value, pw: password.value, stayLoggedIn: stayLoggedIn.value});
};
const logout = () => {
	client.value?.loginManager.logout();
	user.value = null;
};

onMounted(async () => {
	await init();
});

async function addSong() {
	await songsCollection?.createDoc({
		authors: 'A | B',
		content: 'Lyrics go here',
		createdBy: user.value!.user.id,
		language: 'en',
		publisher: 'unknonw',
		slug: 'abcde',
		tags: [],
		title: Math.random().toString(36).substring(2, 7),
		translations: [],
	});
}

async function addSetlist() {
	await setlistCollection?.createDoc({
		active: false,
		createdBy: user.value!.user.id,
		date: '2026-01-01',
		isPublic: true,
		position: 0,
		sharedWith: [],
		slug: 'abcde',
		songs: songs.value.map((s: Song) => ({id: s.id, key: 'A'})).slice(0, 10),
		title: Math.random().toString(36).substring(2, 7),
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
	<div v-if="authenticated">
		Logged in user: {{ user?.user.name }} ({{ user?.user.email }})<br>
		Roles: {{ user?.roles.join(', ') }}<br>
		Tenant: {{ tenant }} ({{ isConnected ? 'connected' : 'not connected' }})
		<button @click="logout">Logout</button>
		<template v-if="user?.roles.includes('admin')">
			<button @click="client?.getAmberUiApi().goToGlobalAdmin()">Manage</button>
		</template>
		<h2>Setlists</h2>
		<p>Edit title: <input type="text" v-model="setlistTitle" /></p>
		<ol>
			<li v-for="setlist in setlists" :key="setlist.id">
				<strong>{{ setlist.entity.title }}</strong> by {{ users[setlist.entity.createdBy]?.name }}
				({{ setlist.entity.songs.length }} songs)
				<a href="#" @click.prevent="editSetlist(setlist)">Save</a>
			</li>
		</ol>
		<button @click="addSetlist()">Add Setlist</button>
		<hr>
		<div v-if="setlists.length > 4 && setlists[4].entity">
			Last Setlist:<br>
			{{ setlists[4].entity.title }}<br>
			Songs:
			<ol>
				<li v-for="song in setlists[4].entity.songs">{{ songIndex[song.id].entity.title }}</li>
			</ol>
		</div>
		<h2>Songs</h2>
		<ol>
			<li v-for="song in songs" :key="song.id">
				<strong>{{ song.entity.title }}</strong> ({{ song.entity.subtitle }})
			</li>
		</ol>
		<button @click="addSong()">Add Song</button>
	</div>
	<div v-else>
		<input type="email" v-model="email" />
		<input type="password" v-model="password" />
		<input type="checkbox" v-model="stayLoggedIn" />
		<button @click="login">Login</button>
	</div>

</template>
