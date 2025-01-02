/*
https://docs.nestjs.com/controllers#controllers
*/

import { Controller, Get } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('get-auth-user')
  getAuthUser() {
    return this.authService.getAuthUser();
  }
  @Get('testIncreaseApple')
  increaseApple(){
    return this.authService.testIncreaseApple();
  }
}
