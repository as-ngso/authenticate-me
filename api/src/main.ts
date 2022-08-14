import { ConfigService } from '@nestjs/config';
import { create } from './app';

async function bootstrap() {
  const app = await create();

  const configService = app.get(ConfigService);

  const port = configService.get('port');
  await app.listen(port);
}

bootstrap();
