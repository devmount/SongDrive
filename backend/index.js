import { amber } from "amberbase";

const appInit =amber().withConfig({
	db_host: 'localhost',
	db_password: 'password',
	db_username: 'admin',
	db_name: 'songdrive',
}).withPath('/amber').withCollection('songs').withUi();

const app = await appInit.create();

app.listen(3000, '0.0.0.0');
