import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // 自动将字符串转换为数字
      transformOptions: {
        enableImplicitConversion: true, // 启用隐式转换
      },
    }),
  );
  const configService = app.get(ConfigService);
  const port = configService.get('port');
  await app.listen(port);
}

bootstrap();
