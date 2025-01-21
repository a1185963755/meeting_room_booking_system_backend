import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserPasswordDto {
  @ApiProperty({
    description: '旧密码',
  })
  @IsNotEmpty({
    message: '旧密码不能为空',
  })
  oldPassword: string;

  @ApiProperty({
    description: '新密码',
  })
  @IsNotEmpty({
    message: '新密码不能为空',
  })
  @MinLength(6, {
    message: '新密码不能少于 6 位',
  })
  newPassword: string;

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
