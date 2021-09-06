import { IsEmail, IsNotEmpty } from 'class-validator';
import { ObjectId } from 'mongoose';
import {
  IFilterCount,
  ResponseDTO,
  ResponseHeaders,
} from 'src/Common/common.dto';
export class UserDTO {
  @IsNotEmpty({ message: 'User Id should not be empty' })
  usersId: number;
  @IsEmail({}, { message: 'Enter Valid Email' })
  @IsNotEmpty({ message: 'Email should not be empty' })
  email: string;
  @IsNotEmpty({ message: 'First Name should not be empty' })
  firstName: string;
  @IsNotEmpty({ message: 'Last Name should not be empty' })
  lastName: string;
  @IsNotEmpty({ message: 'Role should not be empty' })
  role: UserRoles;
  isDeleted = false;
}

export enum UserRoles {
  'Practice_Manager' = 'Practice_Manager',
  'Super_Admin' = 'Super_Admin',
  'Principal_Supervisor' = 'Principal_Supervisor',
  'Supervisor' = 'Supervisor',
  'Accreditation_Support_Coordinator' = 'Accreditation_Support_Coordinator',
  'Accreditor' = 'Accreditor',
  'ASC' = 'Accreditation_Support_Coordinator',
}

export interface IPaginatedResult {
  _id: ObjectId;
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  roleData: string;
}

export class GetUserResponseDTO extends ResponseDTO {
  data: IPaginatedResult[];
  headers: ResponseHeaders[];
}

export class IGetUserDTO {
  paginationResult: IPaginatedResult[];
  totalCount: IFilterCount[];
}
