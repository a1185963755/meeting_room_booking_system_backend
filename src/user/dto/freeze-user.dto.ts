import { IsNotEmpty } from 'class-validator';

export class FreezeUserDto {
  @IsNotEmpty({
    message: '用户id不能为空',
  })
  id: number;
}
