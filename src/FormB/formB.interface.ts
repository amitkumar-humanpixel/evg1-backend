import { ObjectId } from 'mongoose';
import { IAccredition } from 'src/Accredition/accredition.interface';
import { IFormA } from 'src/FormA/formA.interface';
import { IFormA1 } from 'src/FormA1/formA1.interface';
import { IUser } from 'src/User/user.interface';
import { assessmentDTO, applicationsDTO } from './formB.dto';

export interface IFormB extends Document {
  _id: ObjectId;
  accreditionId: ObjectId | IAccredition;
  accreditorId: number;
  accreditationWithEV: boolean;
  formAId: ObjectId | IFormA;
  formA1Id: ObjectId | IFormA1;
  userId: number | IUser;
  isCompleted: boolean;
  isNotify: boolean;
  isDeleted: boolean;
  classification: string;
  dateOfVisit: Date;
  dateOfReportComplete: Date;
  assessment: assessmentDTO[];
  applications: applicationsDTO[];
  practiceDetail: string;
  responseRecommendations: string;
  issueFoundDuringAssesmentOfPaperworkd: string;

  summery: string;
  recomendationPanel: string;
  previousIssues: string;
  reviewedBy: string;
  isAgree: boolean;
}
