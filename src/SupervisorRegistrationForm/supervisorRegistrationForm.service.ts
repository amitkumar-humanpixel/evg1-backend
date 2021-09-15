import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { UserService } from 'src/User/user.service';
import { mailSenderForSupervisorRegistration } from 'src/Listeners/mail.listener';
@Injectable()
export class SupervisorRegistrationFormService {
  constructor(
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
  ) { }

  async getUserDetails(
    userId: number,
    email: string,
    firstName: string,
    lastName: string,
  ) {
    const promiseArr = [];
    promiseArr.push(this.userService.getUserByUserId(userId));
    promiseArr.push(this.userService.getASCData());
    const userData = await Promise.all(promiseArr);
    console.log(userData);
    for (let i = 0; i < userData[1].length; i++) {
      mailSenderForSupervisorRegistration(
        userData[1][i].firstName,
        userData[1][i].lastName,
        userData[1][i].email,
        userData[0].firstName,
        userData[0].lastName,
        email,
        firstName,
        lastName,
      );
    }
  }
}
