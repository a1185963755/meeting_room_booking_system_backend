import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateMeetingRoomDto } from './create-meeting-room.dto';
import { IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class UpdateMeetingRoomDto {
  @ApiProperty({
    description: '会议室ID',
  })
  @IsNotEmpty({
    message: '会议室ID不能为空',
  })
  id: number;

  @ApiProperty({
    description: '会议室名称',
  })
  @IsNotEmpty({
    message: '会议室名称不能为空',
  })
  @MaxLength(10, {
    message: '会议室名称最长为 10 字符',
  })
  name: string;

  @ApiProperty({
    description: '会议室容量',
  })
  @IsNotEmpty({
    message: '容量不能为空',
  })
  capacity: number;

  @ApiProperty({
    description: '会议室位置',
  })
  @IsNotEmpty({
    message: '位置不能为空',
  })
  @MaxLength(50, {
    message: '位置最长为 50 字符',
  })
  location: string;

  @ApiProperty({
    description: '会议室设备',
  })
  @MaxLength(50, {
    message: '设备最长为 50 字符',
  })
  @IsOptional()
  equipment: string;

  @ApiProperty({
    description: '会议室描述',
  })
  @MaxLength(100, {
    message: '描述最长为 100 字符',
  })
  @IsOptional()
  description: string;
}
