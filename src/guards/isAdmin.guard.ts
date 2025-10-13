import { CanActivate, ExecutionContext } from '@nestjs/common';

export class IsAdminGuard implements CanActivate {
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    if (!request.currentUser) return false;
    return request.currentUser.isAdmin;
  }
}
