import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { UserService } from 'src/User/user.service';
import { AccreditionService } from 'src/Accredition/accredition.service';
import * as GuardData from 'src/Shared/guard.json';
@Injectable()
export class FormBGuard implements CanActivate {
  constructor(
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
    @Inject(forwardRef(() => AccreditionService))
    private AccreditionService: AccreditionService,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    if (context.getArgs()[0]?.headers?.userid) {
      const userId = parseInt(context.getArgs()[0]?.headers?.userid);
      return this.userService
        .getUserAndFacilityDetails(userId as number)
        .then((userDetails) => {
          if (userDetails[0] && userDetails[0].role) {
            return this.AccreditionService.checkUserWithUserId(userId as number)
              .then((userData) => {
                if (userData) {
                  if (
                    userDetails[0].role.toLowerCase() === 'accreditor' ||
                    userDetails[0].role.toLowerCase() === 'super_admin' ||
                    userDetails[0].role.toLowerCase() ===
                      'accreditation_support_coordinator'
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
