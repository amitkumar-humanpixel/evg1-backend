import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, Matches, ValidateNested } from 'class-validator';
import { IsObjectId } from 'class-validator-mongo-object-id';
import { ObjectId } from 'mongoose';
import { college } from 'src/Accredition/accredition.dto';
import { IAccredition } from 'src/Accredition/accredition.interface';
import { IUser } from 'src/User/user.interface';
import { fileDetal, SupervisorDetailsDTO } from '../FormA/formA.dto';
import * as SUPERVISORSTANDARDS from '../../static/supervisorStandards.json';
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
    const objSupervisorDetails = new SupervisorDetailsDTOA1();
    objSupervisorDetails.userId = supervisorDetail.userId;
    objSupervisorDetails.contactNumber = supervisorDetail.contactNumber;
    objSupervisorDetails.categoryOfSupervisor =
      supervisorDetail.categoryOfSupervisor;
    objSupervisorDetails.hours = supervisorDetail.hours;
    objSupervisorDetails.isFormA1Complete = supervisorDetail.isFormA1Complete;

    objSupervisorDetails.addStandards(true);

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
  @Matches(/^(\+\d{1,3}[- ]?)?\d{9,12}$/, { message: 'Invalid contact number' })
  contactNumber: string;
  categoryOfSupervisor: string;
  isFormA1Complete: boolean;
  isNotify: boolean;
  status: boolean;
  hours: TimeDTO[];
  college: college[];
  standardsDetail: standardsDetailDTO[];
  isAgree: boolean;

  addStandards(isNew: boolean) {
    if (this.standardsDetail === undefined || this.standardsDetail === null) {
      this.standardsDetail = [];
    }
    for (let index = 0; index < SUPERVISORSTANDARDS.length; index++) {
      const element = SUPERVISORSTANDARDS[index];
      const standards = new standardsDetailDTO();
      standards.allowedFileTypes = element?.allowedFileTypes ?? undefined;
      standards.title = element.title;
      standards.isFileUploadAllowed = element?.isFileUploadAllowed ?? undefined;
      if (isNew) {
        standards.status = element.status;
      }

      this.standardsDetail.push(standards);
    }
  }

  existingStandardsDetailUpdate() {
    for (let index = 0; index < SUPERVISORSTANDARDS.length; index++) {
      const element = SUPERVISORSTANDARDS[index];
      this.standardsDetail.map((standard) => {
        if (standard.title === element.title) {
          standard.allowedFileTypes = element?.allowedFileTypes ?? undefined;
          standard.isFileUploadAllowed =
            element?.isFileUploadAllowed ?? undefined;
        }
      });
    }
  }
}

export class standardsDetailDTO {
  _id: ObjectId;
  @IsNotEmpty({ message: 'Standards title should not be empty' })
  title: string;
  @IsNotEmpty({ message: 'Standards status should not be empty' })
  status: string;
  isFileUploadAllowed: boolean;
  isRemark: boolean;
  allowedFileTypes: string[];
  allowedFileMimeTypes: string[];
  filePath: fileDetal[];
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
  recommendation: string;
  @IsNotEmpty({ message: 'Actioned should not be empty' })
  actioned: string;
  @Type(() => checkListDTO)
  @ValidateNested({ each: true })
  finalCheckLists: checkListDTO[];
}

export class deleteSupervisorStandardsDTO {
  @IsNotEmpty({ message: 'supervisor id should not be empty' })
  @IsNumber({ allowNaN: false }, { message: 'supervisor id should be number' })
  supervisorId: number;
  @IsNotEmpty({ message: 'element id should not be empty' })
  @IsObjectId({ message: 'elementId should not be proper id' })
  elementId: ObjectId;
  @IsNotEmpty({ message: 'file id should not be empty' })
  @IsObjectId({ message: 'file should not be proper id' })
  fileId: ObjectId;
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
