import { Module } from '@nestjs/common';
import { StatisticService } from './statistic.service';
import { StatisticController } from './statistic.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from 'src/booking/entities/booking.entity';
import { MeetingRoom } from 'src/meeting-room/entities/meeting-room.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Booking, MeetingRoom])],
  controllers: [StatisticController],
  providers: [StatisticService],
})
export class StatisticModule {}
