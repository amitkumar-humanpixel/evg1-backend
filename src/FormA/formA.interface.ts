import { ObjectId } from 'mongoose';
import { IAccredition } from 'src/Accredition/accredition.interface';
import {
  FormStatus,
  PracticeManagementDTO,
  PracticeStandardsDTO,
  RegistrarDetailsDTO,
  SupervisorDetailsDTO,
} from './formA.dto';

export interface IFormA extends Document {
  _id: ObjectId;
  accreditionId: ObjectId | IAccredition;
  isDeleted: boolean;
  practiceManagerDetail: PracticeManagementDTO;
  registrarDetails: RegistrarDetailsDTO[];
  supervisorDetails: SupervisorDetailsDTO[];
  practiceStandards: PracticeStandardsDTO[];
  status: FormStatus;
  isCompleted: boolean;
}
