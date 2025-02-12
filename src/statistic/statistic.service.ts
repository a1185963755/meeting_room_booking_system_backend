import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Booking } from 'src/booking/entities/booking.entity';
import { MeetingRoom } from 'src/meeting-room/entities/meeting-room.entity';
import { User } from 'src/user/entities/user.entiey';
import { Repository } from 'typeorm';

@Injectable()
export class StatisticService {
  @InjectRepository(Booking)
  private readonly bookingRepository: Repository<Booking>;

  @InjectRepository(MeetingRoom)
  private readonly meetingRoomRepository: Repository<MeetingRoom>;

  getBookingStatistic() {
    const queryBuilder = this.bookingRepository
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.user', 'user')
      .select('user.id', 'userId')
      .addSelect('user.username', 'username')
      .addSelect('COUNT(booking.id)', 'count')
      .groupBy('user.id');
    return queryBuilder.getRawMany();
  }

  getMeetingRoomStatistic() {
    const queryBuilder = this.meetingRoomRepository
      .createQueryBuilder('meetingRoom')
      .leftJoinAndSelect('meetingRoom.bookings', 'bookings')
      .select('meetingRoom.id', 'meetingRoomId')
      .addSelect('meetingRoom.name', 'meetingRoomName')
      .addSelect('COUNT(bookings.id)', 'count')
      .groupBy('meetingRoom.id');
    return queryBuilder.getRawMany();
  }
}
