import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';

@Injectable()
export class TelegramAuthMiddleware implements NestMiddleware {
  constructor(private readonly authService: AuthService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const telegramId = req.header('X-Telegram-ID');

    if (!telegramId) {
      throw new UnauthorizedException('X-Telegram-ID header is required');
    }

    try {
      let user = await this.authService.getAuthUser(telegramId);
      if (!user) {
        // If user doesn't exist, create a new one
        user = await this.authService.registerNewUser({
          telegram_id: telegramId
        });
      }
      
      (req as any).user = user;
      
      next();
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid telegram user');
    }
  }
}
