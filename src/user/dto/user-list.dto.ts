import { IsInt, IsNotEmpty, IsOptional, Min } from 'class-validator';

export class UserListDto {
  constructor() {
    this.page = 1;
    this.pageSize = 10;
  }

  @IsInt({ message: '页码必须是整数' })
  @Min(1, { message: '页码必须是正整数' })
  page: number;

  @IsInt({ message: '每页数量必须是整数' })
  @Min(1, { message: '每页数量必须是正整数' })
  pageSize: number;

  @IsOptional()
  username?: string;

  @IsOptional()
  nickName?: string;

  @IsOptional()
  email?: string;
}
