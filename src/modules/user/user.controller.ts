import { Controller, Get, Patch, Body, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { TelegramUser } from '../auth/decorators/telegram-user.decorator';

interface AuthUser {
  id: number;
  telegram_id: string;
}

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Patch('heartbeat')
  heartbeat(@TelegramUser() user: AuthUser, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.heartbeat(user.id, updateUserDto);
  }
  @Post('enter-referral-code') 
  setPetAndReferralModal(@TelegramUser() user: AuthUser, @Body('referral_code') referral_code?: string) {
    return this.userService.setPetAndReferralModal(user.id, referral_code);
  }
}
