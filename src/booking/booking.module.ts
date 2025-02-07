import { Module } from '@nestjs/common';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from './entities/booking.entity';
import { MeetingRoom } from 'src/meeting-room/entities/meeting-room.entity';
import { User } from 'src/user/entities/user.entiey';

@Module({
  imports: [TypeOrmModule.forFeature([Booking, User, MeetingRoom])],
  controllers: [BookingController],
  providers: [BookingService],
})
export class BookingModule {}
