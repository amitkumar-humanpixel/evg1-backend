import { Type } from 'class-transformer';
import { IsNotEmpty, ValidateNested } from 'class-validator';
import { ObjectId } from 'mongoose';
import { college } from 'src/Accredition/accredition.dto';
import { IAccredition } from 'src/Accredition/accredition.interface';
import { IUser } from 'src/User/user.interface';
import {
  fileDetal,
  GetSupervisorDetails,
  SupervisorDetailsDTO,
} from '../FormA/formA.dto';
export class WorkingHoursDTO {
  days: string;
  hours: string;
}

export class FormA1DTO {
  accreditionId: ObjectId | IAccredition;
  formAId: ObjectId | IAccredition;
  isDeleted: boolean;
  supervisorDetails: SupervisorDetailsDTOA1[];
  addressRecommendation: addressRecommendationDTO;
  finalCheckList: checkListDTO[];
  status: FormStatus;

  constructor() {
    this.supervisorDetails = [];
    this.finalCheckList = [];
  }

  addFormA1(accreditionId: ObjectId, formAId: ObjectId) {
    this.accreditionId = accreditionId;
    this.formAId = formAId;
    this.status = FormStatus['Pending'];
  }

  addSupervisorDetails(obj: SupervisorDetailsDTOA1) {
    this.supervisorDetails.push(obj);
  }

  addSupervisorsDetails(supervisorDetail: SupervisorDetailsDTO) {
    console.log(supervisorDetail);
    const objSupervisorDetails = new SupervisorDetailsDTOA1();
    objSupervisorDetails.userId = supervisorDetail.userId;
    objSupervisorDetails.contactNumber = supervisorDetail.contactNumber;
    objSupervisorDetails.categoryOfSupervisor =
      supervisorDetail.categoryOfSupervisor;
    objSupervisorDetails.hours = supervisorDetail.hours;
    objSupervisorDetails.isFormA1Complete = supervisorDetail.isFormA1Complete;

    this.addSupervisorDetails(objSupervisorDetails);
  }
}

export class TimeDTO {
  isChecked: string;
  days: string;
  hours: string;
  startTime: string;
  finishTime: string;
}
export class SupervisorDetailsDTOA1 {
  userId: number | IUser;
  contactNumber: string;
  categoryOfSupervisor: string;
  isFormA1Complete: boolean;
  isNotify: boolean;
  status: boolean;
  hours: Array<TimeDTO>;
  college: Array<college>;
  standardsDetail: standardsDetailDTO[];
  isAgree: boolean;
}

export class standardsDetailDTO {
  title: string;
  status: string;
  filePath: Array<fileDetal>;
}

export class addressRecommendationDTO {
  @IsNotEmpty({ message: 'Recommendation should not be empty' })
  recommendation: string;
  @IsNotEmpty({ message: 'Actioned should not be empty' })
  actioned: string;
}

export class checkListDTO {
  @IsNotEmpty({ message: 'Final CheckList title should not be empty' })
  title: string;
  @IsNotEmpty({ message: 'Final CheckList status should not be empty' })
  status: string;
}

export class finalCheckListDetailsDTO {
  @IsNotEmpty({ message: 'List Recommendation should not be empty' })
  recommendation: string;
  @IsNotEmpty({ message: 'Actioned should not be empty' })
  actioned: string;
  @Type(() => checkListDTO)
  @ValidateNested({ each: true })
  finalCheckLists: checkListDTO[];
}

export enum FormStatus {
  'Pending' = 'Pending',
  'Complete' = 'Complete',
  'ReSubmit' = 'ReSubmit',
  'Cancelled' = 'Cancelled',
}

export class GetSupervisorDetail {
  contactNumber: string;
  categoryOfSupervisor: string;
  standardsDetail: standardsDetailDTO[];
  isAgree: boolean;
  userId: number | IUser;
  username: string;
  email: string;
  college: Array<college>;
  hours: Array<TimeDTO>;
}
