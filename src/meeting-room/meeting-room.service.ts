import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateMeetingRoomDto } from './dto/create-meeting-room.dto';
import { UpdateMeetingRoomDto } from './dto/update-meeting-room.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { MeetingRoom } from './entities/meeting-room.entity';
import { MeetingRoomListDto } from './dto/meeting-room-list.dto';

@Injectable()
export class MeetingRoomService {
  @InjectRepository(MeetingRoom)
  private readonly meetingRoomRepository: Repository<MeetingRoom>;

  async findAll(meetingRoomListDto: MeetingRoomListDto) {
    const {
      page = 1,
      pageSize = 10,
      name,
      capacity,
      isBooked,
      location,
    } = meetingRoomListDto;
    const total = await this.meetingRoomRepository.count();
    const queryBuilder =
      this.meetingRoomRepository.createQueryBuilder('meetingRoom');
    if (name) {
      queryBuilder.andWhere('meetingRoom.name LIKE :name', {
        name: `%${name}%`,
      });
    }
    if (capacity) {
      queryBuilder.andWhere('meetingRoom.capacity = :capacity', {
        capacity: Number(capacity),
      });
    }
    if (isBooked) {
      queryBuilder.andWhere('meetingRoom.isBooked = :isBooked', {
        isBooked: 1,
      });
    }
    if (location) {
      queryBuilder.andWhere('meetingRoom.location LIKE :location', {
        location: `%${location}%`,
      });
    }
    const meetingRoom = await queryBuilder
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getMany();

    return {
      data: meetingRoom,
      total,
      page,
      pageSize,
    };
  }

  async create(createMeetingRoomDto: CreateMeetingRoomDto) {
    const meetingRoom = await this.meetingRoomRepository.findOne({
      where: {
        name: createMeetingRoomDto.name,
      },
    });
    if (meetingRoom) {
      throw new BadRequestException('会议室已存在');
    }
    await this.meetingRoomRepository.insert(createMeetingRoomDto);
    return {
      message: '会议室创建成功',
    };
  }

  async update(updateMeetingRoomDto: UpdateMeetingRoomDto) {
    const { id, ...updateData } = updateMeetingRoomDto;
    const meetingRoom = await this.meetingRoomRepository.findOne({
      where: {
        id,
      },
    });
    if (!meetingRoom) {
      throw new BadRequestException('会议室不存在');
    }
    await this.meetingRoomRepository.update(id, updateData);
    return {
      message: '会议室更新成功',
    };
  }

  async findOne(id: number) {
    const meetingRoom = await this.meetingRoomRepository.findOne({
      where: {
        id,
      },
    });
    if (!meetingRoom) {
      throw new BadRequestException('会议室不存在');
    }
    return meetingRoom;
  }

  async deleteOne(id: number) {
    const meetingRoom = await this.meetingRoomRepository.findOne({
      where: {
        id,
      },
    });
    if (!meetingRoom) {
      throw new BadRequestException('会议室不存在');
    }
    await this.meetingRoomRepository.delete(id);
    return {
      message: '会议室删除成功',
    };
  }
}
