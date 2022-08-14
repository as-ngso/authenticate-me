import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UtilModule } from '../util/util.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [UtilModule, UserModule],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
