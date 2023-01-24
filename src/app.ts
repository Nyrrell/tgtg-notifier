import { Client } from "./client.js";

import { USERS } from "./config.js";

const main = async () => {
	for (const user of USERS) {
		await new Client(user).login();
	}
};

main().then();