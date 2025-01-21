import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entiey';
import { md5 } from 'src/utils/crypt';
import { RedisService } from 'src/redis/redis.service';
import { EmailService } from 'src/email/email.service';
import { Permission } from './entities/permission.entity';
import { Role } from './entities/role.entity';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UserService {
  @InjectRepository(User)
  private readonly userRepository: Repository<User>;

  @InjectRepository(Role)
  private readonly roleRepository: Repository<Role>;

  @InjectRepository(Permission)
  private readonly permissionRepository: Repository<Permission>;

  @Inject(RedisService)
  private readonly redisService: RedisService;

  @Inject(EmailService)
  private readonly emailService: EmailService;

  @Inject(JwtService)
  private readonly jwtService: JwtService;

  @Inject(ConfigService)
  private readonly configService: ConfigService;

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

  async initData() {
    const user1 = new User();
    user1.username = 'zhangsan';
    user1.password = md5('111111');
    user1.email = 'xxx@xx.com';
    user1.isAdmin = true;
    user1.nickName = '张三';
    user1.phoneNumber = '13233323333';

    const user2 = new User();
    user2.username = 'lisi';
    user2.password = md5('222222');
    user2.email = 'yy@yy.com';
    user2.nickName = '李四';

    const role1 = new Role();
    role1.name = '管理员';

    const role2 = new Role();
    role2.name = '普通用户';

    const permission1 = new Permission();
    permission1.code = 'ccc';
    permission1.description = '访问 ccc 接口';

    const permission2 = new Permission();
    permission2.code = 'ddd';
    permission2.description = '访问 ddd 接口';

    user1.roles = [role1];
    user2.roles = [role2];

    role1.permissions = [permission1, permission2];
    role2.permissions = [permission1];

    await this.permissionRepository.save([permission1, permission2]);
    await this.roleRepository.save([role1, role2]);
    await this.userRepository.save([user1, user2]);
  }
  async login(loginUserDto: LoginUserDto, isAdmin: boolean = false) {
    const { username, password } = loginUserDto;

    const user = await this.userRepository.findOne({
      where: {
        username,
        isAdmin,
      },
      relations: ['roles', 'roles.permissions'],
    });

    if (!user) {
      if (isAdmin) {
        throw new BadRequestException('用户名不存在或该用户不是管理员');
      } else {
        throw new BadRequestException('用户名不存在');
      }
    }

    if (user.password !== md5(password)) {
      throw new BadRequestException('密码错误');
    }
    const { accessToken, refreshToken } = this.signUser(user);
    return {
      message: '登录成功',
      userInfo: user,
      accessToken,
      refreshToken,
    };
  }

  async refresh(refreshToken: string, isAdmin: boolean = false) {
    try {
      const decoded = this.jwtService.verify(refreshToken);
      const user = await this.userRepository.findOne({
        where: {
          id: decoded.userId,
          isAdmin,
        },
        relations: ['roles', 'roles.permissions'],
      });

      if (!user) {
        throw new BadRequestException('用户名不存在');
      }

      const { accessToken, refreshToken: newRefreshToken } =
        this.signUser(user);

      return {
        message: '刷新token成功',
        accessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      throw new UnauthorizedException('token 过期，请重新登录');
    }
  }

  private signUser(user: User) {
    const accessToken = this.jwtService.sign(
      {
        userId: user.id,
        username: user.username,
        roles: user.roles.map((role) => role.name),
        permissions: user.permissions.map((permission) => permission.code),
      },
      {
        expiresIn:
          this.configService.get('jwt_access_token_expires_time') || '30m',
      },
    );

    const refreshToken = this.jwtService.sign(
      {
        userId: user.id,
      },
      {
        expiresIn:
          this.configService.get('jwt_refresh_token_expires_time') || '7d',
      },
    );
    return {
      accessToken,
      refreshToken,
    };
  }
}
