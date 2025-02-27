import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as MinioClient from 'minio';
import { MinioController } from './minio.controller';

@Global()
@Module({
  controllers: [MinioController],
  providers: [
    {
      provide: 'MINIO_CLIENT',
      inject: [ConfigService],
      async useFactory(configService: ConfigService) {
        const minioClient = new MinioClient.Client({
          endPoint: configService.get('minio_end_point'),
          port: +configService.get('minio_port'),
          useSSL: false,
          accessKey: configService.get('minio_access_key'),
          secretKey: configService.get('minio_secret_key'),
        });
        return minioClient;
      },
    },
  ],
  exports: ['MINIO_CLIENT'],
})
export class MinioModule {}
