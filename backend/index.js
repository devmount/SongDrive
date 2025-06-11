import { amber } from "amberbase";

const appInit = amber()
	.withConfig({
		db_host: 'db',
		db_password: 'root',
		db_username: 'root',
		db_name: 'db',
		db_port: 3306,
	})
	.withPath('/amber')
	.withCollection('songs')
	.withUi();

const app = await appInit.create();

app.listen(3000, '0.0.0.0');
