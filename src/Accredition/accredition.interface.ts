import { ObjectId } from 'mongoose';
import { IFacility } from 'src/Facility/facility.interface';
import { checkListDTO } from 'src/FormA1/formA1.dto';
import { StepDetails } from './accredition.dto';

export interface IAccredition extends Document {
  _id: ObjectId;
  isFormAComplete: boolean;
  isFormA1Complete: boolean;
  isFormBComplete: boolean;
  isPostDetailsComplete: boolean;
  isReaccreditationChecklistComplete: boolean;
  facilityId: number | IFacility;
  address: string;
  phone: string;
  practiceWebsite: string;
  college: Array<string>;
  AccreditationBody: Array<string>;
  AccreditationEndDate: Date;
  formA: Array<StepDetails>;
  formA1: Array<StepDetails>;
  formB: Array<StepDetails>;
  status: string;
  users: Array<string>;
  reaccreditationChecklist: Array<checkListDTO>;
  isAddressRecommendation: boolean;
}
