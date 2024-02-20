import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.enableCors({
    origin: [
      'https://api.arialink.nomoredomainswork.ru',
      'https://arialink.nomoredomainswork.ru',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: [
      'Content-Type',
      'Origin',
      'X-Requested-With',
      'Accept',
      'Authorization',
    ],
    exposedHeaders: ['Authorization'],
    credentials: true,
  });
  await app.listen(process.env.APP_PORT || 3000, () =>
    console.log(`Сервер запущен на порту ${process.env.APP_PORT}`),
  );
}
bootstrap();
