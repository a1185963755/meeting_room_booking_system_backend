import { BadRequestException, Global, Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
@Global()
@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads/',
        filename(req, file, callback) {
          // 自定义文件名
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          callback(
            null,
            `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`,
          );
        },
      }),
      fileFilter: (req, file, callback) => {
        // 检查文件是否是有效的文件类型
        if (!file || !file.originalname || !file.mimetype) {
          return callback(new BadRequestException('上传的文件无效'), false);
        }

        // 检查文件类型（例如只允许图片）
        if (!file.mimetype.startsWith('image/')) {
          return callback(new BadRequestException('只允许上传图片文件'), false);
        }

        // 检查文件扩展名
        const ext = extname(file.originalname).toLowerCase();
        if (!['.jpg', '.jpeg', '.png', '.gif'].includes(ext)) {
          return callback(
            new BadRequestException('只允许上传 JPG, JPEG, PNG 或 GIF 文件'),
            false,
          );
        }

        // 如果文件有效，继续处理
        callback(null, true);
      },
    }),
  ],
  controllers: [UploadController],
  providers: [UploadService],
  exports: [UploadService],
})
export class UploadModule {}
