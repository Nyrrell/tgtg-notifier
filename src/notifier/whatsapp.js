import { Client } from "whatsapp-web.js";
import qrcode from "qrcode-terminal";

import { PRICE, STOCK } from "../config.js";

export default class whatsapp {
  idResolvable;
  filename;
  client;
  chatId;

  constructor(fileName, idResolvable) {
    this.idResolvable = idResolvable;
    this.filename = fileName;

    this.client = new Client({
      puppeteer: { args: ['--disable-dev-shm-usage', '--no-sandbox', '--disable-gpu', '--disable-setuid-sandbox'] },
      disableMessageHistory: false, qrMaxRetries: 5
    });
  };

  resolveChatId = async () => {
    const numberId = await this.client.getNumberId(this.idResolvable);
    if (numberId) return this.chatId = numberId;

    const { id } = await this.client.getChats().then(chats => chats.find(el => el['name'] === this.idResolvable));
    if (id) return this.chatId = id;

    console.error(`[WhatsApp] Unable to resolve '${this.idResolvable}', not a phone number or chat name`);
  };


  init = () => new Promise(async (resolve, reject) => {
    console.log('[WhatsApp] Start init')
    this.client.initialize();

    this.client.on('qr', (qr) => {
      qrcode.generate(qr, { small: true });
      console.log(`Scan this QR code for ${this.filename}`);
    });

    this.client.on('authenticated', () => {
      console.log(`[WhatsApp] ${this.filename} client is authenticated !`);
    });

    this.client.on('ready', async () => {
      await this.resolveChatId();
      console.log(`[WhatsApp] ${this.filename} client is ready !`);
      resolve();
    });

    this.client.on('auth_failure', (msg) => {
      console.error(`[WhatsApp] Authentification failed for '${this.filename}' return this error :\n${msg}`)
      reject();
    });
  });

  sendNotif = (store) => {
    return this.client.sendMessage(
      this.chatId['_serialized'],
      `\`\`\`${store['title']}\`\`\` \n\n` +
      `*${STOCK.padEnd(25)}${PRICE}*\n` +
      `${store['items'].padEnd(29 - store['items'].length)} ${store['price']}\n\n` +
      `${store['pickupInterval'].replace('–', '·')}`);
  };

  sendMonitoring = (user) => {
    return this.client.sendMessage(
      this.chatId['_serialized'],
      `Start monitoring ${user}`
    );
  };
};
