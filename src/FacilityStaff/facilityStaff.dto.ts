import { IsNotEmpty } from 'class-validator';
import { ObjectId } from 'mongoose';
import {
  IFilterCount,
  ResponseDTO,
  ResponseHeaders,
} from 'src/Common/common.dto';
import { IFacility } from 'src/Facility/facility.interface';
import { IUser } from 'src/User/user.interface';
import { IFacilityStaff } from './facilityStaff.interface';

export enum PracticeRoles {
  'Additional Supervisor' = 'Additional Supervisor',
  'Clinical Supervisor' = 'Clinical Supervisor',
  'Educational Supervisor' = 'Educational Supervisor',
  'Practice Admin' = 'Practice Admin',
  'Practice Manager' = 'Practice Manager',
  'Principal Educational Supervisor' = 'Principal Educational Supervisor',
  'Principal Supervisor' = 'Principal Supervisor',
}

export class FacilityStaffDTO {
  @IsNotEmpty({ message: 'Facility Contact Id should not be empty' })
  facilityContactId: number;
  @IsNotEmpty({ message: 'Facility Id should not be empty' })
  facilityId: number | IFacility;
  @IsNotEmpty({ message: 'User Id should not be empty' })
  userId: number | IUser;
  @IsNotEmpty({ message: 'First Name should not be empty' })
  firstName: string;
  @IsNotEmpty({ message: 'Last Name should not be empty' })
  lastName: string;
  @IsNotEmpty({ message: 'Practice Role should not be empty' })
  practiceRole: PracticeRoles;
  isDeleted = false;
}

export interface IPaginatedResult {
  _id: ObjectId;
  facilityContactId: number;
  facilityId: number | IFacility;
  userId: number | IUser;
  firstName: string;
  lastName: string;
  PracticeRole: PracticeRoles;
}

export class IGetFacilityStaffDTO {
  paginationResult: IPaginatedResult[];
  totalCount: IFilterCount[];
}

export class GetFacilityStaffResponseDTO extends ResponseDTO {
  data: IPaginatedResult[];
  headers: ResponseHeaders[];
}

export class GetFacilityStaffDetailsDTO {
  staffDetails: IFacilityStaff[];
  headers: ResponseHeaders[];
}

export class GetFacilityStaffUser {
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export class GetRegistrarUser {
  name: string;
  placementId: number;
}
