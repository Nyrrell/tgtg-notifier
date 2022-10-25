import { Client } from "./client";

import { USERS } from "./config";

const main = async () => {
    for (const user of USERS) {
        await new Client(user).login();
    }
};

main().then();