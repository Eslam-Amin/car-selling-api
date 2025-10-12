import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private userService: UsersService) {}
  async canActivate(
    context: ExecutionContext,
    // ): boolean | Promise<boolean> | Observable<boolean> {
  ) {
    const request = context.switchToHttp().getRequest();
    const { userId } = request.session;
    if (!userId) return false;
    const user = await this.userService.findOne(userId, false);
    if (!user) {
      request.session.destroy?.();
      request.session.userId = null;
      return false;
    }
    if (!user.verified) throw new UnauthorizedException('User is not verified');

    return request.session.userId;
  }
}
