import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Inject,
  forwardRef,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { UserService } from 'src/User/user.service';

@Injectable()
export class UserGuard implements CanActivate {
  constructor(
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
  ) { }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    if (context.getArgs()[0]?.headers?.userid) {
      const userId = parseInt(context.getArgs()[0]?.headers?.userid);
      if (userId === undefined) {
        throw new UnauthorizedException('Token expired!!');
      }
      return this.userService.getUserByUserId(userId).then((userDetails) => {
        if (!userDetails.role.toLowerCase().includes('admin')) {
          throw new BadRequestException(
            'You are not allowed to access this resource!!!',
          );
        } else {
          return true;
        }
      });
    }
    return false;
  }
}
