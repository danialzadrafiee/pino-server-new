import { TelegramController } from './telegram.controller';
import { TelegramService } from './telegram.service';
/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';

@Module({
  imports: [],
  controllers: [TelegramController],
  providers: [TelegramService],
})
export class TelegramModule {}
