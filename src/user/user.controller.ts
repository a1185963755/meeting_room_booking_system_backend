import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Post('captcha')
  async sendEmail(@Body('email') email: string) {
    return this.userService.sendEmail(email);
  }

  @Get('initData')
  async initData() {
    return this.userService.initData();
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto) {
    return this.userService.login(loginUserDto);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Post('admin/login')
  async adminLogin(@Body() loginUserDto: LoginUserDto) {
    return this.userService.login(loginUserDto, true);
  }
  @Post('refresh')
  async refresh(@Body('refreshToken') refreshToken: string) {
    return this.userService.refresh(refreshToken);
  }
  @Post('admin/refresh')
  async adminRefresh(@Body('refreshToken') refreshToken: string) {
    return this.userService.refresh(refreshToken, true);
  }
}
