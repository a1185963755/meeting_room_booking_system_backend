import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateBookingDto {
  @ApiProperty({
    description: '会议室id',
  })
  @IsNotEmpty({ message: '会议室名称不能为空' })
  @IsNumber()
  meetingRoomId: number;

  @ApiProperty({
    description: '开始时间',
  })
  @IsNotEmpty({ message: '开始时间不能为空' })
  @IsNumber()
  startTime: number;

  @ApiProperty({
    description: '结束时间',
  })
  @IsNotEmpty({ message: '结束时间不能为空' })
  @IsNumber()
  endTime: number;

  @ApiProperty({
    description: '备注',
  })
  @IsOptional()
  note: string;
}
