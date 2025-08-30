import { amber, CollectionAccessAction, UserContext } from 'amberbase';
import cookieParser from 'cookie-parser';
import express from 'express';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface SongEntity {
	authors: string; // Song authors, separated by ' | ' (TODO)
	ccli: string; // CCLI id
	content: string; // Song lyrics and chords noted in SongDrive syntax
	createdBy: string; // User id of the creator
	key: string; // Base key of the song
	language: string; // Language code
	publisher: string; // Song publisher information
	subtitle: string; // Displayed song subtitle
	tags: string[]; // List of content tags
	title: string; // Displayed song title
	translations: string[]; // List of song ids that are the same song in another language
	year: number; // Year when the song was created
	youtube: string; // YouTube slug
}

interface SetlistEntity {
	createdBy: string; // User id of the creator
	date: string; // Event date of this setlist
	isPublic: boolean; // If true, the setlist is public and readable by everyone
	sharedWith: string[]; // List of user ids with whom this setlist is shared
	songs: string[]; // List of song ids the setlist contains
	title: string; // Displayed setlist title
}

const EditorRole = 'editor';
const PerformerRole = 'performer';
const ReaderRole = 'reader';

const appInit = amber()
	.withConfig({
		db_host: 'localhost',
		db_password: 'mariapassword',
		db_username: 'root',
		db_name: 'songdrive',
		db_port: 3306,
	})
	.withPath('/amber')
	.withCollection<SongEntity>('songs', {
		accessRights: {
			[EditorRole]: ['create', 'subscribe', 'update', 'delete'],
			[PerformerRole]: ['subscribe'],
			[ReaderRole]: ['subscribe']
		}
	})
	.withCollection<SetlistEntity>('setlists', {
		// we have public setlists that are readable by everyone
		// readers can crud non-public setlists of their own
		// performers can create, public and private setlists
		// public setlists are writable by performers and editors
		// public setlists are deletable by editors or the "createdBy" user
		// we have non-public setlists that are only readable, writable and deletable by the "createdBy" user
		// non-public setlists are only readable, writable and deletable by the "createdBy" user
		// owner of a private setlist can share it with other users by adding their user ids to a "sharedWith" array

		accessRights: (user: UserContext, document: SetlistEntity, action: CollectionAccessAction) => {
			if (action === 'create') {
				if (user.roles.includes(EditorRole) || user.roles.includes(PerformerRole)) {
					return true;
				}
				if (user.roles.includes(ReaderRole)) {
					return document.createdBy === user.userId && !document.isPublic;
				}
				return false;
			}
			if (action === 'subscribe') {
				return true;
			}

			if (action === 'delete') {
				return user.roles.includes(EditorRole) || document.createdBy === user.userId;
			}

			if (action === 'update') {
				if (document.createdBy === user.userId) {
					return true;
				}
				if (document.isPublic && (user.roles.includes(EditorRole) || user.roles.includes(PerformerRole))) {
					return true;
				}
				return false;
			}
			return false;
		},

		accessTagsFromDocument: (document: SetlistEntity) => {
			const tags = [];
			if (document.isPublic) {
				tags.push('p');
			} else {
				tags.push(`o${document.createdBy}`);
				for (const userId of document.sharedWith) {
					tags.push(`s${userId}`);
				}
			}
			return tags;
		},
		accessTagsFromUser: (user: UserContext) => {
			const tags = ['p'];
			tags.push(`o${user.userId}`);
			tags.push(`s${user.userId}`);
			return tags;
		}
	})
	.withUi({
		availableRoles: [EditorRole, PerformerRole, ReaderRole],
		theme: 'dark',
		loginTargetUrl: '/#/tenant={tenant}',
		title: 'SongDrive Manager',
	});

const expressApp = express();
const amberApp = await appInit.create(expressApp);

expressApp.use(cookieParser())
expressApp.use(express.static(path.join(__dirname, 'static')));

expressApp.get('/version', (_req, res) => {
	res.send(`Version: 1.2.3`);
});

amberApp.addAdminIfNotExists('admin@songdrive.de', 'Admin', 'password');
amberApp.addOrUpdateTenant('default', 'Default Tenant', {});

amberApp.listen(3333, '0.0.0.0');
