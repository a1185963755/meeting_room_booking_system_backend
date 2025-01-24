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
    description: '手机号',
  })
  phoneNumber: string;
}
