import { Cron } from "croner";

import { Client } from "./client.js";
import { USERS } from "./config.js";

const main = async (): Promise<void> => {
  const clientsToMonitor: Client[] = [];

  for await (const user of USERS) {
    const initClient: Client = await new Client(user);
    if (await initClient.login()) clientsToMonitor.push(initClient);
  }
  if (!clientsToMonitor.length) return process.exit(1);

  Cron("* * * * *", async (): Promise<void> => {
    for (const client of clientsToMonitor) {
      await client.getItems();
    }
  });
};

await main();
