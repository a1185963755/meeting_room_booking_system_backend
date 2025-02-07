import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { BookingListDto } from './dto/booking-list.dto';
import { ApiOperation } from '@nestjs/swagger';
import { RequireLogin, UserInfo } from 'src/common/decorator/custom.decorator';

@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @ApiOperation({ summary: '创建预定' })
  @Post('create')
  @RequireLogin()
  create(
    @Body() createBookingDto: CreateBookingDto,
    @UserInfo('id') userId: number,
  ) {
    return this.bookingService.create(createBookingDto, userId);
  }

  @ApiOperation({ summary: '获取预定列表' })
  @Get('list')
  @RequireLogin()
  findAll(@Query() query: BookingListDto) {
    return this.bookingService.findAll(query);
  }
  @ApiOperation({ summary: '更新预定' })
  @Post('update')
  update(@Body() updateBookingDto: UpdateBookingDto) {
    return this.bookingService.update(updateBookingDto);
  }
  @ApiOperation({ summary: '催办预定' })
  @Post('remind')
  @RequireLogin()
  remind(@Body('id') id: number) {
    if (!id) {
      throw new BadRequestException('预定ID不能为空');
    }
    return this.bookingService.remind(id);
  }
}
