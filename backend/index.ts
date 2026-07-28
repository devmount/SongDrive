import { amber, CollectionAccessAction, UserContext } from 'amberbase';
import cookieParser from 'cookie-parser';
import express from 'express';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { SetlistEntity, SongEntity } from './models.js';
import { UserRole } from './definitions.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
			[UserRole.Editor]: ['create', 'subscribe', 'update', 'delete'],
			[UserRole.Performer]: ['subscribe'],
			[UserRole.Reader]: ['subscribe']
		}
	})
	.withCollection<SetlistEntity>('setlists', {
		accessRights: (user: UserContext, doc: SetlistEntity | null, action: CollectionAccessAction) => {
			// Public setlists can be created by editors and performers.
			// Private setlists can be created by everyone.
			if (action === 'create') {
				if (user.roles.includes(UserRole.Editor) || user.roles.includes(UserRole.Performer)) {
					return true;
				}
				if (user.roles.includes(UserRole.Reader)) {
					return doc?.createdBy === user.userId && !doc?.isPublic;
				}
				return false;
			}
			// Setlists can be subscribed to by all roles, but only public setlists can be read per default.
			// This is done via access tags below.
			if (action === 'subscribe') {
				return user.roles.includes(UserRole.Editor) || user.roles.includes(UserRole.Performer) || user.roles.includes(UserRole.Reader);
			}
			// Setlists can be deleted by editors or the corresponding creator.
			if (action === 'delete') {
				return user.roles.includes(UserRole.Editor) || doc?.createdBy === user.userId;
			}
			// Setlists can be updated by the corresponding creator.
			// Public setlists can be updated by editors and performers.
			if (action === 'update') {
				if (doc?.createdBy === user.userId) {
					return true;
				}
				if (doc?.isPublic && (user.roles.includes(UserRole.Editor) || user.roles.includes(UserRole.Performer))) {
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
		availableRoles: [UserRole.Editor, UserRole.Performer, UserRole.Reader],
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
