import { IFacility } from 'src/Facility/facility.interface';
import { IUser } from 'src/User/user.interface';
import { PracticeRoles } from './facilityStaff.dto';

export interface IFacilityStaff extends Document {
  facilityContactId: number;
  facilityId: number | IFacility;
  userId: number | IUser;
  firstName: string;
  lastName: string;
  practiceRole: PracticeRoles;
}
