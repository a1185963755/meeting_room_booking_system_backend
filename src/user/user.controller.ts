import {
  BadRequestException,
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { RequireLogin, UserInfo } from 'src/common/decorator/custom.decorator';
import { UpdateUserPasswordDto } from './dto/update-user-password.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FreezeUserDto } from './dto/freeze-user.dto';
import { UnfreezeUserDto } from './dto/unfreeze-user.dto';
import { UserListDto } from './dto/user-list.dto';
import { ApiBody, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ForgetUserPasswordDto } from './dto/forget-user-password.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('用户管理')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  //注册
  @ApiBody({ type: CreateUserDto })
  @ApiOperation({ summary: '注册' })
  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }
  //注册验证码
  @ApiBody({
    schema: { type: 'object', properties: { email: { type: 'string' } } },
  })
  @ApiOperation({ summary: '发送注册验证码' })
  @Post('captcha')
  async sendEmail(@Body('email') email: string) {
    return this.userService.sendEmail(email, 'captcha');
  }
  //修改密码验证码
  @ApiBody({
    schema: { type: 'object', properties: { email: { type: 'string' } } },
  })
  @ApiOperation({ summary: '发送修改密码验证码' })
  @Post('update_password/captcha')
  @RequireLogin()
  async sendUpdatePasswordCaptcha(@Body('email') email: string) {
    return this.userService.sendEmail(email, 'update_password_captcha');
  }

  //忘记密码验证码
  @ApiBody({
    schema: { type: 'object', properties: { email: { type: 'string' } } },
  })
  @ApiOperation({ summary: '发送忘记密码验证码' })
  @Post('forget_password/captcha')
  async sendForgetPasswordCaptcha(@Body('email') email: string) {
    return this.userService.sendEmail(email, 'forget_password_captcha');
  }

  //登录
  @ApiBody({ type: LoginUserDto })
  @ApiOperation({ summary: '登录' })
  @UseGuards(AuthGuard('local'))
  @UseInterceptors(ClassSerializerInterceptor)
  @Post('login')
  async login() {}

  //刷新token
  @ApiBody({
    schema: {
      type: 'object',
      properties: { refreshToken: { type: 'string' } },
    },
  })
  @ApiOperation({ summary: '刷新token' })
  @Post('refresh')
  async refresh(@Body('refreshToken') refreshToken: string) {
    return this.userService.refresh(refreshToken);
  }
  //管理员刷新token
  @ApiBody({
    schema: {
      type: 'object',
      properties: { refreshToken: { type: 'string' } },
    },
  })
  @ApiOperation({ summary: '管理员刷新token' })
  @Post('admin/refresh')
  async adminRefresh(@Body('refreshToken') refreshToken: string) {
    return this.userService.refresh(refreshToken, true);
  }
  //获取用户信息
  @ApiQuery({
    schema: { type: 'object', properties: { userId: { type: 'number' } } },
  })
  @ApiOperation({ summary: '获取用户信息' })
  @UseInterceptors(ClassSerializerInterceptor)
  @Get('info')
  @RequireLogin()
  async getUserInfo(@UserInfo('userId') userId: number) {
    return this.userService.getUserInfo(userId);
  }

  //修改密码
  @ApiBody({ type: UpdateUserPasswordDto })
  @ApiOperation({ summary: '修改密码' })
  @Post(['update-password'])
  @RequireLogin()
  async updatePassword(
    @Body() updateUserPasswordDto: UpdateUserPasswordDto,
    @UserInfo('userId') userId: number,
  ) {
    return this.userService.updatePassword(userId, updateUserPasswordDto);
  }
  //忘记密码
  @ApiBody({ type: ForgetUserPasswordDto })
  @ApiOperation({ summary: '忘记密码' })
  @Post('forget_password')
  async forgetPassword(@Body() forgetUserPasswordDto: ForgetUserPasswordDto) {
    return this.userService.forgetPassword(forgetUserPasswordDto);
  }
  //修改用户信息
  @ApiBody({ type: UpdateUserDto })
  @ApiOperation({ summary: '修改用户信息' })
  @Post(['update'])
  @RequireLogin()
  async updateUserInfo(
    @Body() updateUserDto: UpdateUserDto,
    @UserInfo('userId') userId: number,
  ) {
    return this.userService.updateUserInfo(userId, updateUserDto);
  }
  //冻结用户
  @ApiOperation({ summary: '冻结用户' })
  @Post('freeze')
  @RequireLogin()
  // @RequirePermission('user:freeze')
  async freezeUser(@Body() freezeUserDto: FreezeUserDto) {
    return this.userService.freezeUser(freezeUserDto.id);
  }

  //解冻用户
  @ApiOperation({ summary: '解冻用户' })
  @Post('unfreeze')
  @RequireLogin()
  // @RequirePermission('user:unfreeze')
  async unfreezeUser(@Body() unfreezeUserDto: UnfreezeUserDto) {
    return this.userService.unfreezeUser(unfreezeUserDto.id);
  }

  //获取用户列表
  @ApiOperation({ summary: '获取用户列表' })
  @Get('list')
  @RequireLogin()
  // @RequirePermission('user:list')
  async getUserList(@Query() userListDto: UserListDto) {
    return this.userService.getUserList(userListDto);
  }

  // @ApiBody({ type: UploadImageDto })
  @ApiOperation({ summary: '上传头像' })
  @Post('upload')
  @RequireLogin()
  @UseInterceptors(
    FileInterceptor('file', {
      dest: './uploads',
      storage: diskStorage({
        destination: './uploads/',
        filename(req, file, callback) {
          // 自定义文件名
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          callback(
            null,
            `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`,
          );
        },
      }),
      limits: {
        fileSize: 1024 * 1024 * 3,
      },

      fileFilter(req, file, callback) {
        const filetypes = /jpg|jpeg|png|gif/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(file.originalname.split('.').pop()!);
        if (mimetype && extname) {
          callback(null, true);
        } else {
          callback(new Error('文件类型不合法'), false);
        }
      },
    }),
  )
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('未上传任何文件');
    }
    return await this.userService.uploadImage(file);
  }
}
