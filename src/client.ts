import { AxiosError } from "axios";
import { Cron } from "croner";

import database from "./database.js";
import { User } from "./config.js";
import discord from "./discord.js";
import api from "./api.js";

export class Client {
  private readonly name: string;
  private readonly email: string;
  private userID: string;
  private webhook: discord;
  private accessToken: string;
  private refreshToken: string;
  private favorite: boolean = true;
  private readonly maxPollingTries: Array<number> = new Array(24);

  constructor(user: User) {
    this.name = user["Name"];
    this.email = user["Email"];
    this.userID = user["User-ID"];
    this.favorite = user["Favorite"];
    this.accessToken = user["Access-Token"];
    this.refreshToken = user["Refresh-Token"];
    this.webhook = new discord(user["Webhook"]);
  }

  get credentials(): object {
    return {
      Email: this.email || "No email provide",
      "User-ID": this.userID,
      "Access-Token": this.accessToken,
      "Refresh-Token": this.refreshToken,
    };
  }

  private wait = (ms: number): Promise<void> =>
    new Promise((resolve) => setTimeout(resolve, ms));

  private alreadyLogged = (): Boolean =>
    Boolean(this.userID && this.accessToken && this.refreshToken);

  private refreshAccessToken = async (): Promise<Boolean> => {
    try {
      const { data } = await api.refreshToken(
        this.accessToken,
        this.refreshToken
      );
      this.accessToken = data["access_token"];
      this.refreshToken = data["refresh_token"];
      return true;
    } catch (error) {
      if (error as AxiosError) {
        const { message, response } = error as AxiosError;
        if (response?.["status"] === 403) {
          api.setCookie(response?.headers["set-cookie"] as string[]);
          return this.refreshAccessToken();
        }
        console.error("[Refresh Token]", message);
        return false;
      }
      console.error("[Refresh Token]", error);
      return false;
    }
  };

  private loginByEmail = async (): Promise<void | Boolean> => {
    try {
      const { data } = await api.loginByEmail(this.email);

      if (data["state"] === "TERMS") {
        console.log(
          `TGTG return your email "${this.email}" is not linked to an account, signup with this email first`
        );
        return false;
      }
      if (data["state"] === "WAIT")
        return this.startPolling(data["polling_id"]);
    } catch (error) {
      if (error as AxiosError) {
        const { message, response } = error as AxiosError;
        if (response?.["status"] === 429)
          console.error("Too many requests. Try again later");
        else console.error(message);
        return false;
      }
      console.error("[Login Email]", error);
      return false;
    }
  };

  private startPolling = async (pollingId: string): Promise<Boolean> => {
    try {
      for (const attempt of this.maxPollingTries.keys()) {
        const { data, status } = await api.authPolling(this.email, pollingId);
        if (status === 202) {
          if (attempt === 0)
            console.log(
              "⚠️ Check your email to continue, don't use your mobile if TGTG App is installed !"
            );
          await this.wait(5000);
        } else if (status === 200) {
          console.log(`✅ ${this.name} successfully Logged`);
          this.accessToken = data["access_token"];
          this.refreshToken = data["refresh_token"];
          this.userID = data["startup_data"]["user"]["user_id"];
          console.log(this.credentials);
          return true;
        }
      }
      console.log("Max polling retries reached. Try again.");
      return false;
    } catch (error) {
      if (error as AxiosError) {
        const { message, response } = error as AxiosError;
        if (response?.["status"] === 429) {
          console.error("Too many requests. Try again later.");
        } else {
          console.error(`Connection failed, return this message "${message}"`);
        }
      } else {
        console.error(error);
      }
      return false;
    }
  };

  private getItems = async (withStock: boolean): Promise<void | Boolean> => {
    try {
      const { data } = await api.getItems(
        this.accessToken,
        this.userID,
        withStock
      );

      for (const store of data["items"]) {
        if (withStock) await this.compareStock(store);
        await database.set(
          this.name,
          store["item"]["item_id"],
          withStock ? store["items_available"] : 0
        );
      }
    } catch (error) {
      if (error as AxiosError) {
        const { message, response } = error as AxiosError;
        if (response?.["status"] === 401) return this.refreshAccessToken();
        if (response?.["status"] === 403) {
          api.setCookie(response?.headers["set-cookie"] as string[]);
          return this.getItems(true);
        }
        console.error("[Get Items]", message);
      }
    }
  };

  private compareStock = async (store: any): Promise<void> => {
    const stock = await database.get(this.name, store["item"]["item_id"]);
    if (store["items_available"] > Boolean(stock) && stock === 0)
      return this.webhook.sendNewItemsAvailable(store);
  };

  private monitor = Cron("* * * * *", { paused: true }, async () => {
    await this.getItems(true);
  });

  private startMonitoring = async (): Promise<void> => {
    const message = `Start monitoring ${this.name}`;
    console.log(message);
    await this.webhook.sendMessage(message);
    this.monitor.resume();
  };

  public login = async (): Promise<void> => {
    if (!this.email && !this.alreadyLogged())
      return console.log(
        "You must provide at least Email or User-ID, Access-Token and Refresh-Token"
      );

    const logged = this.alreadyLogged()
      ? await this.refreshAccessToken()
      : await this.loginByEmail();

    if (!logged) return;

    await this.getItems(false);
    return this.startMonitoring();
  };
}
