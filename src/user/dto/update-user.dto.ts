import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class UpdateUserDto {
  @ApiProperty({
    description: '头像',
  })
  headPic: string;

  @ApiProperty({
    description: '昵称',
  })
  nickName: string;

  @ApiProperty({
    description: '邮箱',
  })
  @IsNotEmpty({
    message: '邮箱不能为空',
  })
  @IsEmail(
    {},
    {
      message: '不是合法的邮箱格式',
    },
  )
  email: string;

  @ApiProperty({
    description: '验证码',
  })
  @IsNotEmpty({
    message: '验证码不能为空',
  })
  captcha: string;
}
