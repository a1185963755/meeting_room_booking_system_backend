import { Controller, Get, Inject, Query } from '@nestjs/common';
import * as MinioClient from 'minio';
import { ApiOperation } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

@Controller('minio')
export class MinioController {
  constructor() {}
  @Inject('MINIO_CLIENT')
  private readonly minioClient: MinioClient.Client;
  @Inject(ConfigService)
  private readonly configService: ConfigService;

  @Get('presign')
  @ApiOperation({ summary: '获取上传文件的签名' })
  async sign(@Query('filename') filename: string) {
    const bucketName = this.configService.get('minio_bucket_name');
    return this.minioClient.presignedPutObject(bucketName, filename, 60 * 60);
  }
}
