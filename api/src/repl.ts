import { repl } from '@nestjs/core';
import { AppModule } from './app.module';

async function startRepl() {
  await repl(AppModule);
}

startRepl();
