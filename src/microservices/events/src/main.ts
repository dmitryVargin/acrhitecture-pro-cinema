import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { logger } from './logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global validation
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));

  const port = parseInt(process.env.PORT || '8082', 10);
  await app.listen(port);
  await logger.info('Events service listening', { port });
}

bootstrap().catch(async (err) => {
  await logger.error('Failed to start Events service', { error: err });
  process.exit(1);
});