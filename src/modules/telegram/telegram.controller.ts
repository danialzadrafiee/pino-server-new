/*
https://docs.nestjs.com/controllers#controllers
*/

import { Controller, Get } from '@nestjs/common';
import { TelegramService } from './telegram.service';

@Controller('telegram')
export class TelegramController {
  constructor(private readonly telegramService: TelegramService) {}

  @Get()
  getStatus() {
    return {
      status: 'active',
      message: 'Telegram bot is running. Send /start to the bot to get your user information.'
    };
  }
}
