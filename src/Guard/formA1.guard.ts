import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Inject,
  forwardRef,
  BadRequestException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { UserService } from 'src/User/user.service';
import { AccreditionService } from 'src/Accredition/accredition.service';

@Injectable()
export class FormA1Guard implements CanActivate {
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
      const request = context.switchToHttp().getRequest();
      const params = request.params;
      const requestedUserId = params.userId;
      if (requestedUserId === undefined) {
        return true;
      }
      return this.userService.getUserByUserId(userId).then((userDetails) => {
        if (
          userDetails.role.toLowerCase() === 'supervisor' &&
          userDetails.userId != requestedUserId
        ) {
          throw new BadRequestException(
            'You are not allowed to access this resource!!!',
          );
        } else {
          return true;
        }
      });

      // return this.userService
      //   .getUserAndFacilityDetails(userId as number)
      //   .then((userDetails) => {
      //     if (userDetails[0] && userDetails[0].role) {
      //       return this.AccreditionService.checkUserWithUserId(userId as number)
      //         .then((userData) => {
      //           if (userData) {
      //             console.log(userDetails[0].role.toLowerCase());
      //             if (
      //               userDetails[0].role.toLowerCase() === 'supervisor' ||
      //               userDetails[0].role.toLowerCase() === 'super_admin' ||
      //               userDetails[0].role.toLowerCase() ===
      //                 'principal_supervisor' ||
      //               userDetails[0].role.toLowerCase() === 'practice_manager' ||
      //               userDetails[0].role.toLowerCase() ===
      //                 'accreditation_support_coordinator' ||
      //               userDetails[0].role.toLowerCase() === 'accreditor'
      //             ) {
      //               return true;
      //             } else {
      //               return false;
      //             }
      //           } else {
      //             return false;
      //           }
      //         })
      //         .catch(() => {
      //           return false;
      //         });
      //     } else {
      //       return false;
      //     }
      //   })
      //   .catch(() => {
      //     return false;
      //   });
    }
    return false;
  }
}
