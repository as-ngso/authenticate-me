import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { KnexModule } from './knex/knex.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { UtilModule } from './util/util.module';
import configuration from './config/configuration';
import knexConfig from './db/knexfile';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    KnexModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const env = configService.get('env');
        const knexOptions = knexConfig[env];
        return knexOptions;
      },
    }),
    UserModule,
    AuthModule,
    UtilModule,
  ],
})
export class AppModule {}
