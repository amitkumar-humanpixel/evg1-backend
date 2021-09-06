import { IsEmail, IsNotEmpty } from 'class-validator';
import { ObjectId } from 'mongoose';
import {
  IFilterCount,
  ResponseDTO,
  ResponseHeaders,
} from 'src/Common/common.dto';
export class FacilityDTO {
  @IsNotEmpty({ message: 'Facility Id should not be empty' })
  facilityId: number;
  @IsNotEmpty({ message: 'Practice Name should not be empty' })
  practiceName: string;
  address: string;
  suburb: string;
  postalCode: string;
  email: string;
  @IsNotEmpty({ message: 'Start Date should not be empty' })
  startDate: Date;
  @IsNotEmpty({ message: 'Due Date should not be empty' })
  dueDate: Date;
  isMailSent = false;
  userId: number;
  isDeleted = false;
}

export interface IPaginatedResult {
  _id: ObjectId;
  facilityId: number;
  practiceName: string;
  address: string;
  suburb: string;
  postalCode: string;
  email: string;
  startDate: Date;
  dueDate: Date;
}

export class IGetFacilityDTO {
  paginationResult: IPaginatedResult[];
  totalCount: IFilterCount[];
}

export class GetFacilityDTOResponse extends ResponseDTO {
  data: IPaginatedResult[];
  headers: ResponseHeaders[];
}
