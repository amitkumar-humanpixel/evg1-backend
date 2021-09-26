import { ObjectId } from 'mongoose';
import { IAccredition } from 'src/Accredition/accredition.interface';
import {
  SupervisorDetailsDTOA1,
  addressRecommendationDTO,
  checkListDTO,
  FormStatus,
} from './formA1.dto';

export interface IFormA1 extends Document {
  _id: ObjectId;
  accreditionId: ObjectId | IAccredition;
  formAId: ObjectId | IAccredition;
  isDeleted: boolean;
  supervisorDetails: SupervisorDetailsDTOA1[];
  addressRecommendation: addressRecommendationDTO;
  finalCheckList: checkListDTO[];
  status: FormStatus;
  isNotify: boolean;
}
