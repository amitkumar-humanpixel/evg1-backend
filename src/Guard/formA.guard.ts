import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Inject,
  forwardRef,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { UserService } from 'src/User/user.service';
import { AccreditionService } from 'src/Accredition/accredition.service';

@Injectable()
export class FormAGuard implements CanActivate {
  constructor(
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
    @Inject(forwardRef(() => AccreditionService))
    private AccreditionService: AccreditionService,
  ) { }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    if (context.getArgs()[0]?.headers?.userid) {
      const userId = parseInt(context.getArgs()[0]?.headers?.userid);
      if (userId === NaN) {
        throw new UnauthorizedException('Token expired!!');
      }
      return this.userService
        .getUserAndFacilityDetails(userId as number)
        .then((userDetails) => {
          if (userDetails[0] && userDetails[0].role) {
            if (
              userDetails[0].role.toLowerCase() ===
              'accreditation_support_coordinator' ||
              userDetails[0].role.toLowerCase() === 'super_admin'
            ) {
              return true;
            } else {
              return this.AccreditionService.checkUserWithUserId(
                userId as number,
              )
                .then((userData) => {
                  if (userData) {
                    if (
                      userDetails[0].role.toLowerCase() ===
                      'practice_manager' ||
                      userDetails[0].role.toLowerCase() === 'super_admin' ||
                      userDetails[0].role.toLowerCase() ===
                      'principal_supervisor' ||
                      userDetails[0].role.toLowerCase() ===
                      'accreditation_support_coordinator' ||
                      userDetails[0].role.toLowerCase() === 'accreditor'
                    ) {
                      return true;
                    } else {
                      return false;
                    }
                  } else {
                    return false;
                  }
                })
                .catch(() => {
                  return false;
                });
            }
          } else {
            return false;
          }
        })
        .catch(() => {
          return false;
        });
    }
    return true;
  }
}
