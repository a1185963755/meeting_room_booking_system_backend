import { ApiProperty } from '@nestjs/swagger';
import { BookingStatus } from '../entities/booking.entity';
import { IsEnum, IsOptional } from 'class-validator';

export class UpdateBookingDto {
  @ApiProperty({ description: '预定ID' })
  id: number;

  @ApiProperty({ description: '状态', enum: BookingStatus })
  @IsOptional()
  status: number;

  @ApiProperty({ description: '备注' })
  @IsOptional()
  note: string;
}
