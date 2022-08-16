import { Request } from 'express';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { UpdateUserDTO } from './dto/update-user.dto';
import { UserService } from './user.service';
import { verify } from 'argon2';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('current')
  @UseGuards(AuthGuard)
  async currentUser(@Req() req: Request) {
    return {
      // @ts-ignore
      currentUser: this.serializeUser(req.user),
    };
  }

  @Patch('update')
  @UseGuards(AuthGuard)
  async update(
    @Req() req: Request,
    @Body('password') currentPassword: string,
    @Body('data') input: UpdateUserDTO,
  ) {
    // @ts-ignore
    const currentUser = req.user;

    const match = await verify(currentUser.password, currentPassword);

    if (!match) {
      throw new BadRequestException('wrong password');
    }

    const updatedUser = await this.userService.update(currentUser.id, input);

    return {
      user: this.serializeUser(updatedUser),
    };
  }

  private serializeUser({ password, ...user }) {
    return user;
  }
}
