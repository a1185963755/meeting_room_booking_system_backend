import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors({
    origin: '*', // 允许的来源，可以设置为具体的前端地址
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true, // 允许携带凭证（如 cookies）
  });
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // 自动将字符串转换为数字
    }),
  );
  app.useStaticAssets('uploads', {
    prefix: '/uploads',
  });
  const configService = app.get(ConfigService);
  const swaggerConfig = new DocumentBuilder()
    .setTitle('会议室预订系统')
    .setDescription('会议室预订系统API文档')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api-doc', app, document);
  const port = configService.get('port');
  await app.listen(port);
}

bootstrap();
