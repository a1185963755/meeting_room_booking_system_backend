import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UnfreezeUserDto {
  @ApiProperty({
    description: '用户id',
  })
  @IsNotEmpty({
    message: '用户id不能为空',
  })
  id: number;
}
