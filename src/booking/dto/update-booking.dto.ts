import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateBookingDto } from './create-booking.dto';
import { BookingStatus } from '../entities/booking.entity';
import { IsEnum, IsOptional } from 'class-validator';

export class UpdateBookingDto {
  @ApiProperty({ description: '预定ID' })
  id: number;

  @ApiProperty({ description: '状态', enum: BookingStatus })
  @IsEnum(BookingStatus)
  @IsOptional()
  status: BookingStatus;

  @ApiProperty({ description: '备注' })
  @IsOptional()
  note: string;
}
