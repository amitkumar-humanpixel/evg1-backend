import { IFacility } from 'src/Facility/facility.interface';

export interface IFacilityRegistrar extends Document {
  placementId: number;
  facilityId: number | IFacility;
  firstName: string;
  lastName: string;
  startDate: Date;
  endDate: Date;
}
