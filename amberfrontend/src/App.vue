<script setup lang="ts">
import { onMounted, ref } from 'vue';
import HelloWorld from './components/HelloWorld.vue'

// client side
import { amberClient, type AmberCollection, type AmberCollections, type UserInTenant} from "amber-client"

interface SongEntity{
  createdBy: string; // user id of the creator
	title:string;
	content:string;
}

interface Song{
    entity: SongEntity;
    changeNumber?: number;
    id: string;
}

interface SetlistEntity{
  createdBy:string; // user id of the creator
	sharedWith: string[]; // array of user ids with whom this setlist is shared
	isPublic: boolean; // if true, the setlist is public and readable by everyone
	title:string;
	songs: string[]; // array of song ids
}

interface Setlist{
    entity: SetlistEntity;
    changeNumber?: number;
    id: string;
}


var tenant = ref("");

var hash = window.location.hash;
if (hash.startsWith("#/")) {
  var params = new URLSearchParams(hash.substring(2));
  
    tenant.value = params.get("tenant") || "";
}

var isConnected = ref(false);

// make sure to use the same `path` as on the server side
// If you do not include the tenant, the user will be prompted with the selection of tenant that are available to this user
var client = amberClient().withPath("/amber").withTenant(tenant.value || "default").withAmberUiLogin().start();
// you should now wait until you have a valid user logged in to the tenant. This will happen automatically since the user will be forwarded to a login page and redirected back once he or she is logged in.
var user = ref<UserInTenant|null>(null);

var songs = ref<Song[]>([]);
var setlists = ref<Setlist[]>([]);

var collectionApi: AmberCollections | null;

var songsCollection: AmberCollection<SongEntity> | null =null;
var setlistCollection : AmberCollection<SetlistEntity>| null = null;

 onMounted(async ()=>{
  user.value = await client.userInTenant();
  collectionApi = client.getCollectionsApi();
  songsCollection = collectionApi.getCollection<SongEntity>("songs");
  setlistCollection = collectionApi.getCollection<SetlistEntity>("setlists");

   songsCollection.subscribe(0,(doc)=>{
    let existing = songs.value.find(s=>s.id === doc.id);
    if (existing){
      existing.entity = doc.data;
      existing.changeNumber = doc.change_number;
    } else {
      songs.value.push({id: doc.id, entity: doc.data, changeNumber: doc.change_number});
    }

  },(docDeletedId)=>{
    songs.value = songs.value.filter(s=>s.id !== docDeletedId);
  });

  setlistCollection.subscribe(0,(doc)=>{
    let existing = setlists.value.find(s=>s.id === doc.id);
    if (existing){
      existing.entity = doc.data;
      existing.changeNumber = doc.change_number;
    } else {
      setlists.value.push({id: doc.id, entity: doc.data, changeNumber: doc.change_number});
    }
  },(docDeletedId)=>{
    setlists.value = setlists.value.filter(s=>s.id !== docDeletedId);
  });

  collectionApi.connect();
  collectionApi.onConnectionChanged((connected)=>{
    isConnected.value = connected;
  });
 });

async function addSong() {
  await songsCollection?.createDoc({
    createdBy: user.value!.user.id,
    title: Math.random().toString(36).substring(2, 7),
    content: "Lyrics go here"
  });
}

async function addSetlist() {
  await setlistCollection?.createDoc({
    createdBy: user.value!.user.id,
    title: Math.random().toString(36).substring(2, 7),
    songs: songs.value.map(s=>s.id),
    sharedWith: [],
    isPublic: true
  });
}

</script>

<template>
  <div>
    <a href="https://vite.dev" target="_blank">
      <img src="/vite.svg" class="logo" alt="Vite logo" />
    </a>
    <a href="https://vuejs.org/" target="_blank">
      <img src="./assets/vue.svg" class="logo vue" alt="Vue logo" />
    </a>
  </div>
  <HelloWorld msg="Vite + Vue" />
  Logged in user: {{user?.user.name}} ({{user?.user.email}}) in tenant "{{tenant}}" and it is {{isConnected ? "connected" : "not connected"}}
  <template v-if="user?.roles.includes('admin')">
    <button @click="client.getAmberUiApi().goToGlobalAdmin()">Manage</button>  
  </template>
  <h2>Songs</h2>
  <ul>
    <li v-for="song in songs" :key="song.id">{{song.entity.title}} by {{song.entity.createdBy}}</li>
  </ul>
  <button @click="addSong()">Add Song</button>

  <h2>Setlists</h2>
  <ul>
    <li v-for="setlist in setlists" :key="setlist.id">{{setlist.entity.title}} by {{setlist.entity.createdBy}} ({{setlist.entity.songs.length}} songs)</li>
  </ul>
  <button @click="addSetlist()">Add Setlist</button>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
