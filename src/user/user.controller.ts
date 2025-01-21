import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Post,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { RequireLogin, UserInfo } from 'src/common/decorator/custom.decorator';
import { UpdateUserPasswordDto } from './dto/update-user-password.dto';
import { UpdateUserDto } from './dto/update-user.dto';
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  //注册
  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }
  //注册验证码
  @Post('captcha')
  async sendEmail(@Body('email') email: string) {
    return this.userService.sendEmail(email, 'captcha');
  }
  //修改密码验证码
  @Post('update_password/captcha')
  @RequireLogin()
  async sendUpdatePasswordCaptcha(@Body('email') email: string) {
    return this.userService.sendEmail(email, 'update_password_captcha');
  }
  //修改邮箱验证码
  @Post('update_user/captcha')
  @RequireLogin()
  async sendUpdateUserCaptcha(@Body('email') email: string) {
    return this.userService.sendEmail(email, 'update_user_captcha');
  }
  //初始化数据
  @Get('initData')
  async initData() {
    return this.userService.initData();
  }
  //登录
  @UseInterceptors(ClassSerializerInterceptor)
  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto) {
    return this.userService.login(loginUserDto);
  }
  //管理员登录
  @UseInterceptors(ClassSerializerInterceptor)
  @Post('admin/login')
  async adminLogin(@Body() loginUserDto: LoginUserDto) {
    return this.userService.login(loginUserDto, true);
  }
  //刷新token
  @Post('refresh')
  async refresh(@Body('refreshToken') refreshToken: string) {
    return this.userService.refresh(refreshToken);
  }
  //管理员刷新token
  @Post('admin/refresh')
  async adminRefresh(@Body('refreshToken') refreshToken: string) {
    return this.userService.refresh(refreshToken, true);
  }
  //获取用户信息
  @UseInterceptors(ClassSerializerInterceptor)
  @Get('info')
  @RequireLogin()
  async getUserInfo(@UserInfo('userId') userId: number) {
    return this.userService.getUserInfo(userId);
  }

  //修改密码
  @Post(['update-password', 'admin/update-password'])
  @RequireLogin()
  async updatePassword(
    @Body() updateUserPasswordDto: UpdateUserPasswordDto,
    @UserInfo('userId') userId: number,
  ) {
    return this.userService.updatePassword(userId, updateUserPasswordDto);
  }
  //修改用户信息
  @Post(['update', 'admin/update'])
  @RequireLogin()
  async updateUserInfo(
    @Body() updateUserDto: UpdateUserDto,
    @UserInfo('userId') userId: number,
  ) {
    return this.userService.updateUserInfo(userId, updateUserDto);
  }
}
