import { IsNotEmpty, IsNumber } from 'class-validator';
import { ObjectId } from 'mongoose';
export class PostDetailAddDTO {
  @IsNotEmpty({ message: 'Facility Id should not be empty' })
  @IsNumber({ allowNaN: false }, { message: 'User Id should be number' })
  facilityId: number;
  @IsNotEmpty({ message: 'Address should not be empty' })
  address: string;
  @IsNotEmpty({ message: 'Contact Number should not be empty' })
  phone: string;
  @IsNotEmpty({ message: 'Total Number of GPs should not be empty' })
  totalNumberGPs: string;
  @IsNotEmpty({ message: 'Practice Website should not be empty' })
  practiceWebsite: string;
  @IsNotEmpty({ message: 'College should not be empty' })
  college: college;
  @IsNotEmpty({ message: 'Accreditation Body should not be empty' })
  accreditationBody: Array<accreditionBody>;
  @IsNotEmpty({ message: 'Accreditation End Date should not be empty' })
  accreditationEndDate: Date;
  status: string;
  isDeleted = false;
  isFormAComplete = false;
  isFormA1Complete = false;
  isFormBComplete = false;
  isPostDetailsComplete = true;
}

export class PostDetailsDTO extends PostDetailAddDTO {
  facilityName: string;
}

export enum college {
  'RACGP' = 'RACGP',
  'ACRRM' = 'ACRRM',
}

export enum accreditionBody {
  'AGPAL' = 'AGPAL',
  'QPA' = 'QPA',
}

export enum status {
  'INCOMPLETE' = 'INCOMPLETE',
  'PENDING' = 'PENDING',
  'REVIEW' = 'REVIEW',
  'RESUBMIT' = 'RESUBMIT',
  'COMPLETE' = 'COMPLETE',
}

export class CreateReqAccreditationDTO {
  facilityId: number;
}

export class CreateAccreditionDTO {
  facilityId: number;
  address: string;
  status: string;
  users: Array<number>;
  isDeleted = false;
  isFormAComplete = false;
  isFormA1Complete = false;
  isFormBComplete = false;
  isPostDetailsComplete = false;
  formA: Array<formClass>;
  formA1: Array<formClass>;
  formB: Array<formClass>;
}

export class AccreditionDetails {
  accreditionId: ObjectId;
  facilityId: number;
  userId: number;
}
export class AccreditionDTO {
  accreditionId: ObjectId;
  accreditionName: string;
  accreditionSideBar: AccreditionSideBarDTO[];
}

export class AccreditionSideBarDTO {
  private name: string;
  private complete: boolean;
  isEditable = true;
  private subSteps: SideBarDataDTO[];

  constructor() {
    this.subSteps = [];
  }

  addDetails(stepname: string, complete: boolean) {
    this.name = stepname;
    this.complete = complete;
  }

  addSubSteps(formClass: SideBarDataDTO) {
    this.subSteps.push(formClass);
  }

  clearSubSteps() {
    this.subSteps = [];
  }
}

export class supervisorDataDTO {
  paginatedResult: any;
  totalCount: any;
}

export class formClass {
  stepName: string;
  isComplete: boolean;
  userId: string;

  constructor(stepName: string, isComplete: boolean, userId: string = null) {
    this.stepName = stepName;
    this.isComplete = isComplete;
    if (userId != null) {
      this.userId = userId;
    }
  }
}

export class SideBarDataDTO {
  stepName: string;
  isComplete: boolean;
  userId: string;
  isEditable: boolean;

  constructor(
    stepName: string,
    isComplete: boolean,
    isEditable: boolean,
    userId: string = null,
  ) {
    this.stepName = stepName;
    this.isComplete = isComplete;
    this.isEditable = isEditable;
    if (userId != null) {
      this.userId = userId;
    }
  }
}

export class StepDetails {
  stepName: string;
  isComplete: boolean;
  userId: string;
}
