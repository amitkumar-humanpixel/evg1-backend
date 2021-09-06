import { ObjectId } from 'mongoose';
import {
  IFilterCount,
  ResponseDTO,
  ResponseHeaders,
} from 'src/Common/common.dto';

export class DashboardResult {
  _id: ObjectId;
  accreditionId: ObjectId;
  facilityId: number;
  status: string;
  createdAt: Date;
  practiceName: string;
  formType: string;
}

export class IGetFacilityDTO {
  paginationResult: DashboardResult[];
  totalCount: IFilterCount[];
}

export class GetDashboardDTOResponse extends ResponseDTO {
  data: DashboardResult[];
  headers: ResponseHeaders[];
}
