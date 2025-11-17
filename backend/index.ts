import { amber, CollectionAccessAction, UserContext } from 'amberbase';
import cookieParser from 'cookie-parser';
import express from 'express';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { SetlistEntity, SongEntity } from './models.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const EditorRole = 'editor';
const PerformerRole = 'performer';
const ReaderRole = 'reader';

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
			[EditorRole]: ['create', 'subscribe', 'update', 'delete'],
			[PerformerRole]: ['subscribe'],
			[ReaderRole]: ['subscribe']
		}
	})
	.withCollection<SetlistEntity>('setlists', {
		accessRights: (user: UserContext, document: SetlistEntity, action: CollectionAccessAction) => {
			// Public setlists can be created by editors and performers.
			// Private setlists can be created by everyone.
			if (action === 'create') {
				if (user.roles.includes(EditorRole) || user.roles.includes(PerformerRole)) {
					return true;
				}
				if (user.roles.includes(ReaderRole)) {
					return document.createdBy === user.userId && !document.isPublic;
				}
				return false;
			}
			// Setlists can be subscribed to by all roles, but only public setlists can be read per default.
			// This is done via access tags below.
			if (action === 'subscribe') {
				return user.roles.includes(EditorRole) || user.roles.includes(PerformerRole) || user.roles.includes(ReaderRole);
			}
			// Setlists can be deleted by editory or the corresponding creator.
			if (action === 'delete') {
				return user.roles.includes(EditorRole) || document.createdBy === user.userId;
			}
			// Setlists can be updated by the corresponding creator.
			// Public setlists can be updated by editors and performers.
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

		// The owner of a private setlist can share it with other users
		accessTagsFromDocument: (document: SetlistEntity) => {
			const tags = [`o${document.createdBy}`]; // TODO
			if (document.isPublic) {
				tags.push('p');
			} else {
				document.sharedWith.forEach((userId) => {
					tags.push(`s${userId}`);
				});
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
