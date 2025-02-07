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
import { UpdateUserPasswordDto } from './dto/update-user-password.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserListDto } from './dto/user-list.dto';
import { ForgetUserPasswordDto } from './dto/forget-user-password.dto';
import * as bcrypt from 'bcrypt';
import { UploadService } from 'src/upload/upload.service';

@Injectable()
export class UserService {
  private SALT_ROUNDS = 10;
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

  @Inject(UploadService)
  private readonly uploadService: UploadService;

  async create(createUserDto: CreateUserDto) {
    // 1. 验证验证码是否正确
    const redisKey = `captcha_${createUserDto.email}`;
    const captcha = await this.redisService.get(redisKey);
    if (captcha !== createUserDto.captcha) {
      throw new Error('验证码错误或已过期');
    }

    // 2. 检查用户名是否已存在
    const existingUser = await this.userRepository.findOne({
      where: [
        { username: createUserDto.username },
        { email: createUserDto.email },
      ],
    });
    if (existingUser) {
      throw new Error('用户名或邮箱已存在');
    }

    // 3. 对密码进行加密处理
    const hashedPassword = await bcrypt.hash(
      createUserDto.password,
      this.SALT_ROUNDS,
    );

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

  async sendEmail(email: string, key: string) {
    // 1. 初始化配置
    const captcha = Math.random().toString().slice(-6);
    const expireTime = 5 * 60;
    const mailSubject = '会议室预定系统-验证码';
    const mailContent = `您的验证码是:${captcha}, 有效期为5分钟`;
    // 2. 将验证码保存到Redis,有效期为5分钟
    const redisKey = `${key}_${email}`;
    await this.redisService.set(redisKey, captcha, expireTime);

    // 3. 发送验证码邮件
    await this.emailService.sendEmail(email, mailSubject, mailContent);

    return {
      message: '验证码发送成功',
    };
  }

  async login(loginUserDto: LoginUserDto) {
    const { username, password } = loginUserDto;

    const user = await this.userRepository.findOne({
      where: [{ username: username }, { email: username }],
      relations: ['roles', 'roles.permissions'],
    });

    if (!user) {
      throw new BadRequestException('用户名不存在');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
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
        email: user.email,
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
  async getUserInfo(userId: number) {
    try {
      const user = await this.userRepository.findOne({
        where: {
          id: userId,
        },
        relations: ['roles', 'roles.permissions'],
      });

      if (!user) {
        throw new BadRequestException('用户不存在');
      }

      // 返回用户信息
      return {
        message: '获取用户信息成功',
        userInfo: user,
      };
    } catch (error) {
      throw new BadRequestException('获取用户信息失败');
    }
  }
  async updatePassword(
    id: number,
    updateUserPasswordDto: UpdateUserPasswordDto,
  ) {
    try {
      // 验证验证码是否正确
      const redisKey = `update_password_captcha_${updateUserPasswordDto.email}`;
      const captcha = await this.redisService.get(redisKey);

      if (!captcha || captcha !== updateUserPasswordDto.captcha) {
        throw new BadRequestException('验证码错误或已过期');
      }

      // 查找用户
      const user = await this.userRepository.findOne({
        where: {
          id,
          email: updateUserPasswordDto.email,
        },
      });

      if (!user) {
        throw new BadRequestException('用户不存在');
      }

      const newPassword = updateUserPasswordDto.newPassword;
      const oldPassword = updateUserPasswordDto.oldPassword;

      // 验证旧密码是否正确

      const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
      if (!isPasswordValid) {
        throw new BadRequestException('旧密码错误');
      }

      if (newPassword === oldPassword) {
        throw new BadRequestException('新旧密码不能相同');
      }

      // 更新密码
      // 3. 对密码进行加密处理
      const hashedPassword = await bcrypt.hash(newPassword, this.SALT_ROUNDS);
      user.password = hashedPassword;
      await this.userRepository.save(user);

      // 删除验证码
      await this.redisService.del(redisKey);

      return {
        message: '密码修改成功',
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('密码修改失败');
    }
  }
  // 忘记密码
  async forgetPassword(forgetUserPasswordDto: ForgetUserPasswordDto) {
    try {
      // 验证验证码是否正确
      const redisKey = `forget_password_captcha_${forgetUserPasswordDto.email}`;
      const captcha = await this.redisService.get(redisKey);

      if (!captcha || captcha !== forgetUserPasswordDto.captcha) {
        throw new BadRequestException('验证码错误或已过期');
      }

      // 查找用户
      const user = await this.userRepository.findOne({
        where: {
          email: forgetUserPasswordDto.email,
        },
      });

      if (!user) {
        throw new BadRequestException('用户不存在');
      }

      const newPassword = forgetUserPasswordDto.password;
      // 对比新旧密码是否相同
      const isSamePassword = await bcrypt.compare(newPassword, user.password);
      if (isSamePassword) {
        throw new BadRequestException('新旧密码不能相同');
      }

      // 对新密码进行哈希
      const hashedPassword = await bcrypt.hash(newPassword, this.SALT_ROUNDS);

      // 更新密码
      user.password = hashedPassword;
      await this.userRepository.save(user);

      // 删除验证码
      await this.redisService.del(redisKey);

      return {
        message: '密码修改成功',
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('密码修改失败');
    }
  }
  // 修改用户信息
  async updateUserInfo(userId: number, updateUserDto: UpdateUserDto) {
    try {
      // 查找用户
      const user = await this.userRepository.findOne({
        where: {
          id: userId,
        },
      });

      if (!user) {
        throw new BadRequestException('用户不存在');
      }

      if (updateUserDto.nickName) {
        user.nickName = updateUserDto.nickName;
      }
      if (updateUserDto.headPic) {
        user.headPic = updateUserDto.headPic;
      }
      if (updateUserDto.phoneNumber) {
        user.phoneNumber = updateUserDto.phoneNumber;
      }

      await this.userRepository.save(user);

      return {
        message: '用户信息修改成功',
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('用户信息修改失败');
    }
  }
  // 冻结用户
  async freezeUser(userId: number) {
    try {
      // 查找用户
      const user = await this.userRepository.findOne({
        where: {
          id: userId,
        },
      });
      if (!user) {
        throw new BadRequestException('用户不存在');
      }

      // 检查用户是否已被冻结
      if (user.isFrozen) {
        throw new BadRequestException('用户已被冻结');
      }

      // 冻结用户
      user.isFrozen = true;
      await this.userRepository.save(user);

      return {
        message: '用户冻结成功',
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('用户冻结失败');
    }
  }

  // 解冻用户
  async unfreezeUser(userId: number) {
    try {
      // 查找用户
      const user = await this.userRepository.findOne({
        where: {
          id: userId,
        },
      });

      if (!user) {
        throw new BadRequestException('用户不存在');
      }

      // 检查用户是否已被解冻
      if (!user.isFrozen) {
        throw new BadRequestException('用户未被冻结');
      }

      // 解冻用户
      user.isFrozen = false;
      await this.userRepository.save(user);

      return {
        message: '用户解冻成功',
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('用户解冻失败');
    }
  }
  // 获取用户列表
  async getUserList(userListDto: UserListDto) {
    try {
      // 构建查询条件
      const { page, pageSize, username, nickName, email } = userListDto;

      const queryBuilder = this.userRepository.createQueryBuilder('user');
      // 添加可选的过滤条件
      if (username) {
        queryBuilder.andWhere('user.username LIKE :username', {
          username: `%${username}%`,
        });
      }
      if (nickName) {
        queryBuilder.andWhere('user.nickName LIKE :nickName', {
          nickName: `%${nickName}%`,
        });
      }
      if (email) {
        queryBuilder.andWhere('user.email LIKE :email', {
          email: `%${email}%`,
        });
      }

      // 计算总数
      const total = await queryBuilder.getCount();

      // 分页查询
      const users = await queryBuilder
        .skip((page - 1) * pageSize)
        .take(pageSize)
        .getMany();
      // 移除敏感信息
      const safeUsers = users.map((user) => {
        const { password, ...rest } = user;
        return rest;
      });

      return {
        users: safeUsers,
        total,
        page,
        pageSize,
      };
    } catch (error) {
      throw new BadRequestException('获取用户列表失败');
    }
  }
  // 上传头像
  async uploadImage(file: Express.Multer.File) {
    const result = this.uploadService.uploadFile([file]);
    return {
      message: '图片上传成功',
      data: result,
    };
  }
}
