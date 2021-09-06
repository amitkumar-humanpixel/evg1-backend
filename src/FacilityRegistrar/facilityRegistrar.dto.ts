import { IsNotEmpty } from 'class-validator';
import { ObjectId } from 'mongoose';
import {
  IFilterCount,
  ResponseDTO,
  ResponseHeaders,
} from 'src/Common/common.dto';
import { IFacility } from 'src/Facility/facility.interface';

export class FacilityRegistrarDTO {
  @IsNotEmpty({ message: 'Placement Id should not be empty' })
  placementId: number;
  @IsNotEmpty({ message: 'Facility Id should not be empty' })
  facilityId: number | IFacility;
  @IsNotEmpty({ message: 'First Name should not be empty' })
  firstName: string;
  @IsNotEmpty({ message: 'Last Name should not be empty' })
  lastName: string;
  @IsNotEmpty({ message: 'Start Date should not be empty' })
  startDate: Date;
  @IsNotEmpty({ message: 'End Date should not be empty' })
  endDate: Date;
  isDeleted = false;
}

export class IPaginatedResult {
  _id: ObjectId;
  placementId: number;
  facilityId: number | IFacility;
  firstName: string;
  lastName: string;
  startDate: Date;
  endDate: Date;
}

export class IGetFacilityRegistrarDTO {
  paginationResult: IPaginatedResult[];
  totalCount: IFilterCount[];
}

export class GetFacilityRegistrarDTOResponse extends ResponseDTO {
  data: IPaginatedResult[];
  headers: ResponseHeaders[];
}
