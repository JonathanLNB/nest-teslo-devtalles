import { SetMetadata } from '@nestjs/common';

export const META_ROLES: string = 'roles';
export const RoleProtected = (...args: string[]) =>
  SetMetadata(META_ROLES, args);
