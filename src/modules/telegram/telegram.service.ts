import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as TelegramBot from 'node-telegram-bot-api';
import { AuthService } from '../auth/auth.service';
import { REFERRAL_CONFIG } from '../../constants/referral.constants';

@Injectable()
export class TelegramService implements OnModuleInit {
  private bot: TelegramBot;
  private readonly logger = new Logger(TelegramService.name);

  constructor(private readonly authService: AuthService) {
    this.bot = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: true });
  }

  async sendReferralNotification(referrerTelegramId: number, newUser: { 
    telegram_username?: string;
    telegram_firstname?: string;
    telegram_lastname?: string;
  }) {
    try {
      const profitMultiplier = REFERRAL_CONFIG.DIRECT_INVITE_PROFIT_MULTIPLIER * 100;
      const userIdentifier = newUser.telegram_username 
        ? `@${newUser.telegram_username}` 
        : `${newUser.telegram_firstname}${newUser.telegram_lastname ? ' ' + newUser.telegram_lastname : ''}`;

      const message = `🎉 Congratulations!\n\n${userIdentifier} joined using your referral link!\n\nYou got +${profitMultiplier}% profit multiplier from their earnings!`;
      
      await this.bot.sendMessage(referrerTelegramId, message);
    } catch (error) {
      this.logger.error('Error sending referral notification:', error);
    }
  }

  onModuleInit() {
    this.bot.onText(/\/start(?:\s+(\w+))?/, async (msg, match) => {
      Logger.log(msg.from)
      try {
        // Extract referral code if provided
        const referrerCode = match ? match[1] : undefined;
        // Register or get existing user
        const user = await this.authService.registerNewUser({
          telegram_id: msg.from.id,
          telegram_username: msg.from.username,
          telegram_firstname: msg.from.first_name,
          telegram_lastname: msg.from.last_name,
          referrer_code: referrerCode
        });

        // If user was registered with a referral code, find referrer and send notification
        if (referrerCode) {
          const referrer = await this.authService.findUserByReferralCode(referrerCode);
          if (referrer) {
            await this.sendReferralNotification(Number(referrer.telegram_id), {
              telegram_username: msg.from.username,
              telegram_firstname: msg.from.first_name,
              telegram_lastname: msg.from.last_name
            });
          }
        }

        // Prepare welcome message
        let welcomeMessage = '🎮 Welcome to the Game!';
        if (user.referral_code) {
          welcomeMessage += `\n\n🎫 Your referral code: ${user.referral_code}`;
          welcomeMessage += '\nShare this code with friends to earn bonuses!';
        }
        welcomeMessage += '\n\nClick the button below to start playing:';

        const botUsername = (await this.bot.getMe()).username;
        const shareUrl = `https://t.me/${botUsername}?start=${user.referral_code}`;

        const inlineKeyboard = {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: '🎮 Start Game',
                  web_app: { url: 'https://pin-vite.developerpie.com' }
                }
              ],
              [
                {
                  text: '🔗 Share Referral Link',
                  url: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent('Join me in this awesome game! Use my referral code to get started.')}`
                }
              ]
            ]
          }
        };

        await this.bot.sendMessage(msg.chat.id, welcomeMessage, inlineKeyboard);
      } catch (error) {
        console.error('Error in /start command:', error);
        await this.bot.sendMessage(msg.chat.id, '❌ Sorry, something went wrong. Please try again later.');
      }
    });
  }
}
