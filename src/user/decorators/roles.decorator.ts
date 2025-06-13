import { SetMetadata } from '@nestjs/common';
import { UserDesignation } from '../enums/user-designation.enum';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserDesignation[]) => SetMetadata(ROLES_KEY, roles); 