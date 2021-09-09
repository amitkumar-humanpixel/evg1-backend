import { Type } from 'class-transformer';
import { IsNotEmpty, ValidateNested } from 'class-validator';
import { ObjectId } from 'mongoose';
import { IAccredition } from 'src/Accredition/accredition.interface';
import { GetSupervisorDetails, SupervisorDetailsDTO } from '../FormA/formA.dto';
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
  finalCheckList: finalCheckListDTO[];
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
    const objSupervisorDetails = new SupervisorDetailsDTOA1();
    objSupervisorDetails.userId = supervisorDetail.userId;
    objSupervisorDetails.contactNumber = supervisorDetail.contactNumber;
    objSupervisorDetails.categoryOfSupervisor =
      supervisorDetail.categoryOfSupervisor;
    objSupervisorDetails.isFormA1Complete = supervisorDetail.isFormA1Complete;

    this.addSupervisorDetails(objSupervisorDetails);
  }
}

export class TimeDTO {
  isChecked: boolean;
  days: string;
  hours: number;
  startTime: number;
  finishTime: number;
}
export class SupervisorDetailsDTOA1 extends SupervisorDetailsDTO {
  hours: TimeDTO[];
  standardsDetail: standardsDetailDTO[];
  isFormA1Complete: boolean;
  constructor() {
    super();
    this.hours = [];
    this.standardsDetail = [];
  }
}

export class standardsDetailDTO {
  title: string;
  status: boolean;
  filePath: string;
}

export class addressRecommendationDTO {
  @IsNotEmpty({ message: 'Recommendation should not be empty' })
  recommendation: string;
  @IsNotEmpty({ message: 'Actioned should not be empty' })
  actioned: string;
}

export class finalCheckListDTO {
  @IsNotEmpty({ message: 'Final CheckList title should not be empty' })
  title: string;
  @IsNotEmpty({ message: 'Final CheckList status should not be empty' })
  status: boolean;
}

export class finalCheckListDetailsDTO {
  @IsNotEmpty({ message: 'List Recommendation should not be empty' })
  recommendation: string;
  @IsNotEmpty({ message: 'Actioned should not be empty' })
  actioned: string;
  @Type(() => finalCheckListDTO)
  @ValidateNested({ each: true })
  finalCheckLists: finalCheckListDTO[];
}

export enum FormStatus {
  'Pending' = 'Pending',
  'Complete' = 'Complete',
  'ReSubmit' = 'ReSubmit',
  'Cancelled' = 'Cancelled',
}

export class GetSupervisorDetail extends GetSupervisorDetails {
  contactNumber: string;
  categoryOfSupervisor: string;
  hours: TimeDTO[];
  standardsDetail: standardsDetailDTO[];
}
