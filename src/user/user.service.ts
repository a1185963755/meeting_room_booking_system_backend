import { Inject, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entiey';
import { md5 } from 'src/utils/crypt';
import { RedisService } from 'src/redis/redis.service';
import { EmailService } from 'src/email/email.service';

@Injectable()
export class UserService {
  @InjectRepository(User)
  private readonly userRepository: Repository<User>;

  @Inject(RedisService)
  private readonly redisService: RedisService;

  @Inject(EmailService)
  private readonly emailService: EmailService;

  async create(createUserDto: CreateUserDto) {
    // 1. 验证验证码是否正确
    const redisKey = `captcha_${createUserDto.email}`;
    const captcha = await this.redisService.get(redisKey);
    if (captcha !== createUserDto.captcha) {
      throw new Error('验证码错误或已过期');
    }

    // 2. 检查用户名是否已存在
    const existingUser = await this.userRepository.findOne({
      where: { username: createUserDto.username },
    });
    if (existingUser) {
      throw new Error('用户名已存在');
    }

    // 3. 对密码进行加密处理
    const hashedPassword = md5(createUserDto.password);

    // 4. 创建用户实体并保存
    const user = new User();
    user.username = createUserDto.username;
    user.password = hashedPassword;
    user.email = createUserDto.email;
    user.nickName = createUserDto.nickName;

    await this.userRepository.save(user);

    // 5. 清理验证码缓存
    await this.redisService.del(redisKey);

    // 示例返回
    return {
      message: '用户注册成功',
      userInfo: {
        username: createUserDto.username,
        nickName: createUserDto.nickName,
        email: createUserDto.email,
      },
    };
  }

  async sendEmail(email: string) {
    // 1. 初始化配置
    const captcha = Math.random().toString().slice(-6);
    const expireTime = 5 * 60;
    const mailSubject = '会议室预定系统-验证码';
    const mailContent = `您的验证码是:${captcha}, 有效期为5分钟`;
    // 2. 将验证码保存到Redis,有效期为5分钟
    const redisKey = `captcha_${email}`;
    await this.redisService.set(redisKey, captcha, expireTime);

    // 3. 发送验证码邮件
    await this.emailService.sendEmail(email, mailSubject, mailContent);

    return {
      message: '验证码发送成功',
    };
  }
}
