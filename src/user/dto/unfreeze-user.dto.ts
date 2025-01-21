import { IsNotEmpty } from 'class-validator';

export class UnfreezeUserDto {
  @IsNotEmpty({
    message: '用户id不能为空',
  })
  id: number;
}
