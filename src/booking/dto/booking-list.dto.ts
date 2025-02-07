import { IsInt, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class BookingListDto {
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
    description: '预订人',
  })
  @IsOptional()
  userName?: string;

  @ApiProperty({
    description: '会议室名称',
  })
  @IsOptional()
  roomName?: string;

  @ApiProperty({
    description: '会议室位置',
  })
  @IsOptional()
  roomLocation?: string;

  @ApiProperty({
    description: '开始时间',
  })
  @IsOptional()
  startTime?: Date;

  @ApiProperty({
    description: '结束时间',
  })
  @IsOptional()
  endTime?: Date;
}
