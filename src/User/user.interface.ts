import * as role from './user.dto';
export interface IUser extends Document {
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  role: role.UserRoles;
}
