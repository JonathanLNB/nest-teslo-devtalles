import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { User } from '../../entities/auth.entity';

@Injectable()
export class UserRoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const validRoles: string[] = this.reflector.get(
      'roles',
      context.getHandler(),
    );

    const req = context.switchToHttp().getRequest();
    const user: User = req.user as User;

    if (!validRoles) {
      return true;
    }
    if (validRoles.length == 0) return true;

    if (!user)
      throw new InternalServerErrorException('User not found (request)');

    for (const role of user.roles) {
      if (validRoles.includes(role)) return true;
    }

    throw new ForbiddenException(
      `User ${user.fullName} need a valid role: [${validRoles}]`,
    );
  }
}
