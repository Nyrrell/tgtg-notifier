import WAWebJS from "whatsapp-web.js";
import qrcode from "qrcode-terminal";

import { PRICE, STOCK } from "../config.js";

const { Client, LocalAuth } = WAWebJS;

export default class whatsapp extends Client {
  idResolvable;
  filename;
  chatId;

  constructor(fileName, idResolvable) {
    super({
      authStrategy: new LocalAuth({ clientId: fileName }),
      puppeteer: { args: ['--disable-dev-shm-usage', '--no-sandbox', '--disable-gpu', '--disable-setuid-sandbox'] },
      disableMessageHistory: false, qrMaxRetries: 5
    });
    this.idResolvable = idResolvable;
    this.filename = fileName;
  };

  resolveChatId = async () => {
    const numberId = await super.getNumberId(this.idResolvable);
    if (numberId) return this.chatId = numberId;

    const { id } = await super.getChats().then(chats => chats.find(el => el['name'] === this.idResolvable));
    if (!id) return console.error(`[WhatsApp] Unable to resolve '${this.idResolvable}', not a phone number or chat name`);

    this.chatId = id;
  };


  init = () => new Promise(async (resolve, reject) => {
    console.log('[WhatsApp] Start init')
    super.initialize();

    super.on('qr', (qr) => {
      qrcode.generate(qr, { small: true });
      console.log(`Scan this QR code for ${this.filename}`);
    });

    super.on('authenticated', () => {
      console.log(`[WhatsApp] ${this.filename} client is authenticated !`);
    });

    super.on('ready', async () => {
      await this.resolveChatId();
      console.log(`[WhatsApp] ${this.filename} client is ready !`);
      resolve();
    });

    super.on('auth_failure', (msg) => {
      console.error(`[WhatsApp] Authentification failed for '${this.filename}' return this error :\n${msg}`)
      reject();
    });
  });

  sendNotif = (store) => super.sendMessage(
    this.chatId['_serialized'],
    `\`\`\`${store['title']}\`\`\` \n\n` +
    `*${STOCK.padEnd(25)}${PRICE}*\n` +
    `${store['items'].padEnd(29 - store['items'].length)} ${store['price']}\n\n` +
    `${store['pickupInterval'].replace('–', '·')}`);

  sendMonitoring = (user) => super.sendMessage(
    this.chatId['_serialized'],
    `Start monitoring ${user}`
  );
};
