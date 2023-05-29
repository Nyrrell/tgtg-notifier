import { Cron } from "croner";

import { Client } from "./client.js";
import { debug, USERS } from "./config.js";

const main = async (): Promise<void> => {
  const clientsToMonitor: Client[] = [];

  for await (const user of USERS) {
    debug(`[Init] ${user.Name}`);
    const initClient: Client = await new Client(user);
    if (await initClient.login()) clientsToMonitor.push(initClient);
  }

  if (!clientsToMonitor.length) {
    console.log("No account to monitor, process exit.");
    return process.exit(1);
  }

  Cron("* * * * *", async (): Promise<void> => {
    for (const client of clientsToMonitor) {
      await client.getItems();
    }
  });
};

console.log(
  "Too Good To Go Monitor is starting in ver.",
  process.env.npm_package_version
);
await main();
