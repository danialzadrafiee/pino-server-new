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
      // Convert string to BigInt since telegram_id is BigInt in schema
      const user = await this.authService.getAuthUser(BigInt(telegramId));
      if (!user) {
        throw new UnauthorizedException('User not found');
      }
      
      // Attach the user to the request object
      (req as any).user = user;
      
      next();
    } catch (error) {
      throw new UnauthorizedException('Invalid telegram user');
    }
  }
}
