import { Response } from 'express';
import {
  Body,
  Controller,
  Delete,
  Headers,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDTO } from './dto/register.dto';
import { LoginDTO } from './dto/login.dto';
import { AuthGuard } from './guards/auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Body() input: RegisterDTO,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user, accessToken } = await this.authService.register(input);
    res.statusCode = 201;
    return { user, accessToken };
  }

  @Post('login')
  async login(
    @Body() input: LoginDTO,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user, accessToken } = await this.authService.login(input);
    res.statusCode = 201;
    return { user, accessToken };
  }

  @Delete('logout')
  @UseGuards(AuthGuard)
  async logout(
    @Query() query: { all: string },
    @Headers('authorization') token: string,
  ) {
    let result: boolean;

    if (query.all === 'true') {
      result = await this.authService.logoutFromAllDevices(token);
    } else {
      result = await this.authService.logout(token);
    }

    return { success: result };
  }
}
