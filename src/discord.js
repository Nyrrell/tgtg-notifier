import { WebhookClient, MessageEmbed } from 'discord.js';
import "dotenv/config";

const { WEBHOOK } = process.env;

const client = new WebhookClient({url: WEBHOOK});

