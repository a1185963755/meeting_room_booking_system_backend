import { IsInt, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UserListDto {
  constructor() {
    this.page = 1;
    this.pageSize = 10;
  }

  @ApiProperty({
    description: '页码',
  })
  @IsInt({ message: '页码必须是整数' })
  @Min(1, { message: '页码必须是正整数' })
  page: number;

  @ApiProperty({
    description: '每页数量',
  })
  @IsInt({ message: '每页数量必须是整数' })
  @Min(1, { message: '每页数量必须是正整数' })
  pageSize: number;

  @ApiProperty({
    description: '用户名',
  })
  @IsOptional()
  username?: string;

  @ApiProperty({
    description: '昵称',
  })
  @IsOptional()
  nickName?: string;

  @ApiProperty({
    description: '邮箱',
  })
  @IsOptional()
  email?: string;
}
