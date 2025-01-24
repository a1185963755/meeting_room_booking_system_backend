import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import {
  existsSync,
  readdirSync,
  createReadStream,
  createWriteStream,
  rmSync,
  statSync,
  cpSync,
  mkdirSync,
} from 'fs';
import sharp from 'sharp';

@Injectable()
export class UploadService {
  uploadFile(file: Array<Express.Multer.File>) {
    if (!file || file.length < 1) {
      throw new BadRequestException('请选择一个文件');
    }
    const path: string[] = [];
    file.forEach((item) => {
      path.push(item.path.replace('\\', '/'));
    });
    return path;
  }

  mergeChunks(name: string) {
    const chunkDir = `uploads/chunks_${name}`;
    if (!existsSync(chunkDir)) {
      throw new HttpException(
        {
          msg: '文件分片不存在',
          code: 400,
        },
        HttpStatus.OK,
      );
    }
    const files = readdirSync(chunkDir);
    let startPos = 0;
    let count = 0;
    files.map((file) => {
      const chunkFilePath = `${chunkDir}/${file}`;
      const stream = createReadStream(chunkFilePath);
      stream
        .pipe(createWriteStream(`uploads/${name}`, { start: startPos }))
        .on('finish', () => {
          count++;
          if (count === files.length) {
            rmSync(chunkDir, { recursive: true });
          }
        });
      startPos += statSync(chunkFilePath).size;
    });
  }

  uploadChunk(chunk: Array<Express.Multer.File>, name: string) {
    const fileName = name.match(/(.+)\-\d+$/)?.[1];
    const chunkDir = `uploads/chunks_${fileName}`;
    if (!existsSync(chunkDir)) {
      mkdirSync(chunkDir);
    }
    cpSync(chunk[0].path, `${chunkDir}/${name}`);
    rmSync(chunk[0].path);
    return '分片上传成功';
  }

  async compression(path: string, color: number) {
    const data = await sharp(path, {
      animated: true,
      limitInputPixels: false,
    })
      .gif({
        colours: color,
      })
      .toBuffer();
    return data;
  }
}
