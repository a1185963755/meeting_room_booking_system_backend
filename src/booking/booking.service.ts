import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { MeetingRoom } from 'src/meeting-room/entities/meeting-room.entity';
import { User } from 'src/user/entities/user.entiey';
import { Repository } from 'typeorm';
import { Booking } from './entities/booking.entity';
import { BookingListDto } from './dto/booking-list.dto';
import { RedisService } from 'src/redis/redis.service';
import { EmailService } from 'src/email/email.service';

@Injectable()
export class BookingService {
  @InjectRepository(Booking)
  private readonly bookingRepository: Repository<Booking>;

  @InjectRepository(User)
  private readonly userRepository: Repository<User>;

  @InjectRepository(MeetingRoom)
  private readonly meetingRoomRepository: Repository<MeetingRoom>;

  @Inject(RedisService)
  private readonly redisService: RedisService;

  @Inject(EmailService)
  private readonly emailService: EmailService;

  private validateTime(time: number | string | Date) {
    console.log(time);
    const timeDate = new Date(time);
    if (isNaN(timeDate.getTime())) {
      throw new BadRequestException('时间格式不正确');
    }
  }

  async create(createBookingDto: CreateBookingDto, userId: number) {
    const { meetingRoomId, startTime, endTime, note } = createBookingDto;
    this.validateTime(startTime);
    this.validateTime(endTime);

    if (startTime >= endTime) {
      throw new BadRequestException('结束时间必须晚于开始时间');
    }
    const meetingRoom = await this.meetingRoomRepository.findOne({
      where: { id: meetingRoomId },
    });
    if (!meetingRoom) {
      throw new BadRequestException('会议室不存在');
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new BadRequestException('用户不存在');
    }

    const booking = this.bookingRepository.create({
      user,
      room: meetingRoom,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      note,
    });

    const existingBooking = await this.bookingRepository
      .createQueryBuilder('booking')
      .where('booking.roomId = :roomId', { roomId: meetingRoomId })
      .andWhere('booking.startTime <= :endTime', { endTime: booking.endTime })
      .andWhere('booking.endTime >= :startTime', {
        startTime: booking.startTime,
      })
      .getOne();

    if (existingBooking) {
      throw new BadRequestException('预定时间段有冲突，预定失败');
    }
    await this.bookingRepository.save(booking);
    return '预定成功';
  }

  async findAll(query: BookingListDto) {
    const {
      page,
      pageSize,
      userName,
      roomName,
      roomLocation,
      startTime,
      endTime,
    } = query;

    const queryBuilder = this.bookingRepository
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.user', 'user')
      .leftJoinAndSelect('booking.room', 'room');

    if (userName) {
      queryBuilder.andWhere('user.username LIKE :userName', {
        userName: `%${userName}%`,
      });
    }

    if (roomName) {
      queryBuilder.andWhere('room.name LIKE :roomName', {
        roomName: `%${roomName}%`,
      });
    }

    if (roomLocation) {
      queryBuilder.andWhere('room.location LIKE :roomLocation', {
        roomLocation: `%${roomLocation}%`,
      });
    }

    if (startTime) {
      this.validateTime(startTime);
      queryBuilder.andWhere('booking.startTime >= :startTime', {
        startTime: new Date(startTime),
      });
    }

    if (endTime) {
      this.validateTime(endTime);
      queryBuilder.andWhere('booking.endTime <= :endTime', {
        endTime: new Date(endTime),
      });
    }

    const total = await queryBuilder.getCount();

    const bookings = await queryBuilder
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getMany();

    // 处理返回数据，移除密码字段
    const bookingsWithoutPassword = bookings.map((booking) => {
      const { user, ...bookingInfo } = booking;
      const { password, ...userInfo } = user;
      return {
        ...bookingInfo,
        user: userInfo,
      };
    });

    return {
      data: bookingsWithoutPassword,
      total,
      page,
      pageSize,
    };
  }

  async update(updateBookingDto: UpdateBookingDto) {
    const { note, id, status } = updateBookingDto;
    const booking = await this.bookingRepository.findOne({ where: { id } });
    if (!booking) {
      throw new BadRequestException('预定不存在');
    }
    booking.note = note;
    booking.status = status;
    await this.bookingRepository.save(booking);
    return '更新成功';
  }

  async remind(id: number) {
    const booking = await this.bookingRepository.findOne({ where: { id } });
    if (!booking) {
      throw new BadRequestException('预定不存在');
    }

    const remindRedisKey = `remind_${id}`;
    const isReminded = await this.redisService.get(remindRedisKey);
    if (isReminded) {
      throw new BadRequestException('每个小时只能催办一次');
    }

    const emailRedisKey = 'admin_email';
    let adminEmail = await this.redisService.get(emailRedisKey);
    if (!adminEmail) {
      const admin = await this.userRepository.findOne({
        where: { isAdmin: true },
      });
      if (!admin) {
        throw new BadRequestException('管理员不存在');
      }
      adminEmail = admin.email;
      await this.redisService.set(emailRedisKey, adminEmail);
    }

    await this.emailService.sendEmail(
      adminEmail,
      '会议预定催办',
      `您有会议预定需要催办，请及时处理，预定信息如下：${JSON.stringify(booking)}`,
    );
    await this.redisService.set(remindRedisKey, '1', 60 * 60);
    return '催办成功';
  }
}
