import { Controller, Get } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('get-auth-user')
  getAuthUser() {
    return this.authService.getAuthUser();
  }
}
