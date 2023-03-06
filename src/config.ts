import { readFile } from "node:fs/promises";

const configFile = await readFile("./config.json", "utf8").catch(
  ({ message }) => console.error(message)
);
if (!configFile) process.exit(1);

const config = JSON.parse(configFile);

export const STOCK: string = config["Available"] || "Available";
export const PRICE: string = config["Price"] || "Price";
export const TIMEZONE: string = config["Timezone"] || "UTC";
export const LOCALE: string = config["Locale"] || "en-US";
export const USERS: User[] = config["Users"];

export type User = {
  Name: string;
  Email: string;
  "User-ID": string;
  "Access-Token": string;
  "Refresh-Token": string;
  Favorite: boolean;
  Webhook: string;
};
