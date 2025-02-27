import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { LoginUserDto } from 'src/user/dto/login-user.dto';
import { UserService } from 'src/user/user.service';

//碰到useguards(authguard('local'))会调用authgurd，authguard会查找已经在某个模块中providers出来的localStrategy类。并且实例化这个类，然后调用这个实例对象的validate方法，验证通过则调用后面的函数。不通过就抛出错误。
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  @Inject(UserService)
  private readonly userService: UserService;

  async validate(username: string, password: string): Promise<any> {
    const dto = new LoginUserDto();
    dto.username = username;
    dto.password = password;
    return this.userService.login(dto);
  }
}
