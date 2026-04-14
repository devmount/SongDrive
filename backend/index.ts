import { amber, CollectionAccessAction, UserContext } from 'amberbase';
import cookieParser from 'cookie-parser';
import express from 'express';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { SetlistEntity, SongEntity } from './models.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

enum Roles {
	Editor = 'editor',
	Performer = 'performer',
	Reader = 'reader',
}

const appInit = amber()
	.withConfig({
		db_host: 'localhost',
		db_password: 'root',
		db_username: 'root',
		db_name: 'songdrive',
		db_port: 3306,
	})
	.withPath('/amber')
	.withCollection<SongEntity>('songs', {
		accessRights: {
			[Roles.Editor]: ['create', 'subscribe', 'update', 'delete'],
			[Roles.Performer]: ['subscribe'],
			[Roles.Reader]: ['subscribe']
		}
	})
	.withCollection<SetlistEntity>('setlists', {
		accessRights: (user: UserContext, doc: SetlistEntity | null, action: CollectionAccessAction) => {
			// Handle non existing doc
			if (!doc) return false;

			// Public setlists can be created by editors and performers.
			// Private setlists can be created by everyone.
			if (action === 'create') {
				if (user.roles.includes(Roles.Editor) || user.roles.includes(Roles.Performer)) {
					return true;
				}
				if (user.roles.includes(Roles.Reader)) {
					return doc.createdBy === user.userId && !doc.isPublic;
				}
				return false;
			}
			// Setlists can be subscribed to by all roles, but only public setlists can be read per default.
			// This is done via access tags below.
			if (action === 'subscribe') {
				return user.roles.includes(Roles.Editor) || user.roles.includes(Roles.Performer) || user.roles.includes(Roles.Reader);
			}
			// Setlists can be deleted by editors or the corresponding creator.
			if (action === 'delete') {
				return user.roles.includes(Roles.Editor) || doc.createdBy === user.userId;
			}
			// Setlists can be updated by the corresponding creator.
			// Public setlists can be updated by editors and performers.
			if (action === 'update') {
				if (doc.createdBy === user.userId) {
					return true;
				}
				if (doc.isPublic && (user.roles.includes(Roles.Editor) || user.roles.includes(Roles.Performer))) {
					return true;
				}
				return false;
			}

			return false;
		},

		// The owner of a private setlist can share it with other users
		accessTagsFromDocument: (doc: SetlistEntity) => {
			const tags = [`o-${doc.createdBy}`];
			if (doc.isPublic) {
				tags.push('public');
			} else {
				doc.sharedWith.forEach((userId) => {
					tags.push(`s-${userId}`);
				});
			}
			return tags;
		},
		accessTagsFromUser: (user: UserContext) => [
			'public',
			`o-${user.userId}`,
			`s-${user.userId}`,
		],
	})
	.withUi({
		availableRoles: [Roles.Editor, Roles.Performer, Roles.Reader],
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
