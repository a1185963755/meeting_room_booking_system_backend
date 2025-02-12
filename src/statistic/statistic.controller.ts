import { Controller, Get } from '@nestjs/common';
import { StatisticService } from './statistic.service';
import { ApiOperation } from '@nestjs/swagger';
import { RequireLogin } from 'src/common/decorator/custom.decorator';

@Controller('statistic')
export class StatisticController {
  constructor(private readonly statisticService: StatisticService) {}

  @ApiOperation({ summary: '获取预定统计' })
  @Get('booking')
  @RequireLogin()
  async getBookingStatistic() {
    return this.statisticService.getBookingStatistic();
  }

  @ApiOperation({ summary: '获取会议室统计' })
  @Get('meetingRoom')
  @RequireLogin()
  async getMeetingRoomStatistic() {
    return this.statisticService.getMeetingRoomStatistic();
  }
}
