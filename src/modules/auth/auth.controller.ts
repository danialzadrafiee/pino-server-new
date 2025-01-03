import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  BadRequestException,
  ParseIntPipe,
  Logger,
} from '@nestjs/common';
import { AuthService } from './auth.service';

interface RegisterUserDto {
  telegram_id: number;
  telegram_username?: string;
  telegram_firstname?: string;
  telegram_lastname?: string;
  referrer_code?: string;
}

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  registerUser(@Body() userData: RegisterUserDto) {
    return this.authService.registerNewUser(userData);
  }

  @Post('get-auth-user')
  getAuthUser(@Body('telegram_id') telegramId: number) {
    this.logger.log(`Getting auth user for telegram_id: ${telegramId}`);
    if (!telegramId) {
      throw new BadRequestException('telegram_id is required');
    }
    return this.authService.getAuthUser(telegramId);
  }
}
