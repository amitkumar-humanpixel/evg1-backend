import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, ValidateNested } from 'class-validator';

import { ObjectId } from 'mongoose';
import { IUser } from 'src/User/user.interface';
import { IAccredition } from 'src/Accredition/accredition.interface';

export class AssignAccreditorDetailDTO {
  accreditorId: number;
}
export class SummaryDTO {
  accreditionId: ObjectId;
  accreditorId: number;
  accreditationWithEV: boolean;
  @IsNotEmpty({ message: 'Classification should not be empty' })
  classification: string;
  @IsNotEmpty({ message: 'Date of visit should not be empty' })
  dateOfVisit: Date;
  @IsNotEmpty({ message: 'Date Report Completed should not be empty' })
  dateOfReportComplete: Date;
  @Type(() => assessmentDTO)
  @ValidateNested({ each: true })
  assessment: assessmentDTO[];
  @Type(() => applicationsDTO)
  @ValidateNested({ each: true })
  applications: applicationsDTO[];
  @IsNotEmpty({ message: 'Shady Oaks Practice should not be empty' })
  shadyOaksPractice: string;
}

export class OtherDetailsDTO {
  @IsNotEmpty({ message: 'Previous Issues should not be empty' })
  previousIssues: string;
  @IsNotEmpty({ message: 'Summary Comments should not be empty' })
  summery: string;
  @IsNotEmpty({ message: 'Recommendations to Panel should not be empty' })
  recomendationPanel: string;
  @IsNotEmpty({ message: 'Reviewed By should not be empty' })
  reviewedBy: string;
}
export class FormBDTO {
  accreditionId: ObjectId | IAccredition;
  formAId: ObjectId | IAccredition;
  formA1Id: ObjectId | IAccredition;
  userId: number | IUser;
  isCompleted: boolean;
  isDeleted: boolean;
  classification: string;
  dateOfVisit: Date;
  dateOfReportComplete: Date;
  assessment: assessmentDTO[];
  applications: applicationsDTO[];
  shadyOaksPractice: string;

  previousIssues: string;
  summery: string;
  recomendationPanel: string;
  reviewedBy: string;

  constructor() {
    this.assessment = [];
    this.applications = [];
  }

  addFormB(accreditionId: ObjectId, formAId: ObjectId, formA1Id: ObjectId) {
    this.accreditionId = accreditionId;
    this.formA1Id = formA1Id;
    this.formAId = formAId;
  }
}

export class TimeDTO {
  @IsNotEmpty({ message: 'Days should not be empty' })
  days: string;
  @IsNotEmpty({ message: 'Hours should not be empty' })
  @IsNumber({ allowNaN: false }, { message: 'User Id should be number' })
  hours: number;
  @IsNotEmpty({ message: 'Start Time should not be empty' })
  @IsNumber({ allowNaN: false }, { message: 'User Id should be number' })
  startTime: number;
  @IsNotEmpty({ message: 'Finish Time should not be empty' })
  @IsNumber({ allowNaN: false }, { message: 'User Id should be number' })
  finishTime: number;
}

export class assessmentDTO {
  @IsNotEmpty({ message: 'Assessment title should not be empty' })
  title: string;
  status: boolean;
}

export class applicationsDTO {
  @IsNotEmpty({ message: 'Supervisor Id should not be empty' })
  supervisorId: number | IUser;
  isFormRegistrar: boolean;
  RACGP: boolean;
  ACRRM: boolean;
  consideration: boolean;
  remarks: string;
}

export class applicationsDetailDTO extends applicationsDTO {
  name: string;
  categoryOfSupervisor: string;
}

export class SummaryDataDTO {
  accreditationWithEV: boolean;
  accreditorDetails: accreditorDetails;
  assessment: assessmentDTO[];
  applications: applicationsDTO[];
  classification: string;
  dateOfVisit: Date;
  dateOfReportComplete: Date;
  shadyOaksPractice: string;
}

export class accreditorDetails {
  userId: number;
  name: string;
}
