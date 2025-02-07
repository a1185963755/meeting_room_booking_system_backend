import { Controller, Get, Post, Body, Query, Param } from '@nestjs/common';
import { MeetingRoomService } from './meeting-room.service';
import { CreateMeetingRoomDto } from './dto/create-meeting-room.dto';
import { UpdateMeetingRoomDto } from './dto/update-meeting-room.dto';
import { MeetingRoomListDto } from './dto/meeting-room-list.dto';
import { ApiOperation } from '@nestjs/swagger';
import { RequireLogin } from 'src/common/decorator/custom.decorator';

@Controller('meeting-room')
export class MeetingRoomController {
  constructor(private readonly meetingRoomService: MeetingRoomService) {}

  @ApiOperation({ summary: '获取会议室列表' })
  @Get('list')
  @RequireLogin()
  findAll(@Query() meetingRoomListDto: MeetingRoomListDto) {
    return this.meetingRoomService.findAll(meetingRoomListDto);
  }

  @ApiOperation({ summary: '创建会议室' })
  @Post('create')
  @RequireLogin()
  create(@Body() createMeetingRoomDto: CreateMeetingRoomDto) {
    return this.meetingRoomService.create(createMeetingRoomDto);
  }

  @ApiOperation({ summary: '更新会议室' })
  @Post('update')
  @RequireLogin()
  update(@Body() updateMeetingRoomDto: UpdateMeetingRoomDto) {
    return this.meetingRoomService.update(updateMeetingRoomDto);
  }

  @ApiOperation({ summary: '获取会议室详情' })
  @Get(':id')
  @RequireLogin()
  findOne(@Param('id') id: number) {
    return this.meetingRoomService.findOne(id);
  }

  @ApiOperation({ summary: '删除会议室' })
  @Post('delete')
  @RequireLogin()
  delete(@Body('id') id: number) {
    return this.meetingRoomService.deleteOne(id);
  }
}
