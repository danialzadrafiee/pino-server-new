/*
https://docs.nestjs.com/providers#services
*/

import { Injectable, OnModuleInit } from '@nestjs/common';
import * as TelegramBot from 'node-tedeclare module 'node-telegram-bot-api';legram-bot-api';

@Injectable()
export class TelegramService implements OnModuleInit {
  private bot: TelegramBot;

  constructor() {
    this.bot = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: true });
  }

  onModuleInit() {
    this.bot.onText(/\/start/, (msg) => {
      const inlineKeyboard = {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '🎮 Start Game',
                web_app: { url: 'https://pin-vite.developerpie.com/' }
              }
            ]
          ]
        }
      };
      this.bot.sendMessage(msg.chat.id, '🎮 Welcome to the Game!\nClick the button below to start playing:', inlineKeyboard);
    });
  }
}
