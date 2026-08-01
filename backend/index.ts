import { amber } from 'amberbase';
import cookieParser from 'cookie-parser';
import express from 'express';
import rateLimit from 'express-rate-limit';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { setlistsAccessRights, setlistsAccessTagsFromDocument, setlistsAccessTagsFromUser } from './access.js';
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
		accessRights: setlistsAccessRights,
		accessTagsFromDocument: setlistsAccessTagsFromDocument,
		accessTagsFromUser: setlistsAccessTagsFromUser,
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

// Fallback to the SPA entry point for client-side routes (e.g. /profile) on hard reload.
// Splat was chosen as conventional default name.
const spaFallbackLimiter = rateLimit({
	windowMs: 60 * 1000,
	limit: 100,
	standardHeaders: true,
	legacyHeaders: false,
});
expressApp.get('/*splat', spaFallbackLimiter, (_req, res) => {
	res.sendFile(path.join(__dirname, 'static', 'index.html'));
});

amberApp.addAdminIfNotExists('admin@songdrive.de', 'Admin', 'password');
amberApp.addOrUpdateTenant('default', 'Default Tenant', {});

amberApp.listen(3333, '0.0.0.0');
