import { IsInt, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class MeetingRoomListDto {
  constructor() {
    this.page = 1;
    this.pageSize = 10;
  }

  @ApiProperty({
    description: '页码',
  })
  @IsInt({ message: '页码必须是整数' })
  @Min(1, { message: '页码必须是正整数' })
  @Transform(({ value }) => {
    return parseInt(value);
  })
  page: number;

  @ApiProperty({
    description: '每页数量',
  })
  @IsInt({ message: '每页数量必须是整数' })
  @Min(1, { message: '每页数量必须是正整数' })
  @Transform(({ value }) => {
    return parseInt(value);
  })
  pageSize: number;

  @ApiProperty({
    description: '会议室名称',
  })
  @IsOptional()
  name?: string;
  @ApiProperty({
    description: '会议室容量',
  })
  @IsOptional()
  capacity?: number;

  @ApiProperty({
    description: '会议室是否被预定',
  })
  @IsOptional()
  @Transform(({ value }) => {
    return value === 'true';
  })
  isBooked?: boolean;

  @ApiProperty({
    description: '会议室位置',
  })
  @IsOptional()
  location?: string;
}
