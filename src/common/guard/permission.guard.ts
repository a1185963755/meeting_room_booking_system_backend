import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';

@Injectable()
export class PermissionGuard implements CanActivate {
  @Inject()
  private reflector: Reflector;

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user) {
      return true;
    }
    const permissions = this.reflector.getAllAndOverride('require-permission', [
      context.getClass(),
      context.getHandler(),
    ]);
    if (!permissions) {
      return true;
    }

    const userPermissions = user.permissions;
    const hasPermission = permissions.every((permission: string) =>
      userPermissions.some(
        (userPermission: string) => userPermission == permission,
      ),
    );
    if (!hasPermission) {
      throw new ForbiddenException('用户没有权限');
    }

    return true;
  }
}
