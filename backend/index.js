import { amber } from "amberbase";
import express from 'express';

const appInit = amber()
	.withConfig({
		db_host: 'localhost',
		db_password: 'root',
		db_username: 'root',
		db_name: 'amber',
		db_port: 3306,
	})
	.withPath('/amber')
	.withCollection('songs')
	.withCollection('setlists')
	.withCollection('languages')
	.withCollection('tags')
	.withUi({
		availableRoles: ['editor', 'performer', 'reader'],
		theme: 'dark',
		loginTargetUrl: '/#/tenant={tenant}',
		title: 'SongDrive Manager',
	});

const expressApp = express();
const app = await appInit.create(expressApp);
expressApp.get('/version', (_req, res) => {
	res.send(`Version: 1.2.3`);
});

app.auth.addUserToTenant(
	'admin@songdrive.de',
	'Admin',
	'password',
	'*', // global tenant admin
	['admin', 'editor']
);

app.listen(3333, '0.0.0.0');
