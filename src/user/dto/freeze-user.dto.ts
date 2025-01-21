import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class FreezeUserDto {
  @ApiProperty({
    description: '用户id',
  })
  @IsNotEmpty({
    message: '用户id不能为空',
  })
  id: number;
}
