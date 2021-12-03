import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  Matches,
  Validate,
  ValidateNested,
} from 'class-validator';
import { IsObjectId } from 'class-validator-mongo-object-id';
import { ObjectId } from 'mongoose';
import { college } from 'src/Accredition/accredition.dto';
import { IAccredition } from 'src/Accredition/accredition.interface';
import { IFacilityStaff } from 'src/FacilityStaff/facilityStaff.interface';
import { IUser } from 'src/User/user.interface';
import { TimeRule } from 'src/Utils/validation.utils';

export class PracticeManagerDTO {
  @IsNotEmpty({ message: 'User Id should not be empty' })
  @IsNumber({ allowNaN: false }, { message: 'User Id should not be empty' })
  userId: number;
  @IsNotEmpty({ message: 'Contact Number should not be empty' })
  @Matches(/^(\+\d{1,3}[- ]?)?\d{9,12}$/, { message: 'Invalid contact number' })
  contactNumber: string;
  usualWorkingHours: WorkingHoursDTO;
  @Type(() => TimeDTO)
  @Validate(TimeRule, { message: 'Invalid time inputs' })
  hours: TimeDTO[];
}

export class PracticeManagerDetails extends PracticeManagerDTO {
  name: string;
  email: string;
}

export class TimeDTO {
  isChecked: string;
  @IsNotEmpty({ message: 'Days should not be empty' })
  days: string;
  @IsNotEmpty({ message: 'Hours should not be empty' })
  hours: string;
  @IsNotEmpty({ message: 'Start Time should not be empty' })
  startTime: string;
  @IsNotEmpty({ message: 'Finish Time should not be empty' })
  finishTime: string;
}

export class WorkingHoursDTO {
  @IsNotEmpty({ message: 'Days should not be empty' })
  days: string;
  hours: string;
}

export class FormADTO {
  accreditionId: ObjectId | IAccredition;
  isDeleted: boolean;
  practiceManagerDetail: PracticeManagementDTO;
  registrarDetails: RegistrarDetailsDTO[];
  supervisorDetails: SupervisorDetailsDTO[];
  practiceStandards: PracticeStandardsDTO[];
  status: FormStatus;
  isCompleted: boolean;

  constructor() {
    this.registrarDetails = [];
    this.supervisorDetails = [];
    this.practiceStandards = [];
  }

  addFormA(
    accreditionId: ObjectId,
    practiceManagerDetail: PracticeManagementDTO,
  ) {
    this.accreditionId = accreditionId;
    this.practiceManagerDetail = practiceManagerDetail;
  }

  addNewFormA(accreditionId: ObjectId) {
    this.accreditionId = accreditionId;
  }
}

export class PracticeManagementDTO {
  userId: number | IUser;
  contactNumber: string;
  usualWorkingHours: WorkingHoursDTO;
  hours: TimeDTO[];

  constructor() {
    this.hours = [];
  }

  addPracticeManagement(
    userId: number,
    contactNumber: string,
    usualWorkingHours: WorkingHoursDTO,
    hours: TimeDTO[],
  ) {
    this.userId = userId;
    this.contactNumber = contactNumber;
    this.usualWorkingHours = usualWorkingHours;
    this.hours = hours;
  }
}

export class RegistrarDetailsDTO {
  @IsNotEmpty({ message: 'Placement Id should not be empty' })
  @IsNumber({ allowNaN: false }, { message: 'User Id should be number' })
  placementId: number | IFacilityStaff;
  @Type(() => TimeDTO)
  @ValidateNested({ each: true })
  @Validate(TimeRule, { message: 'Invalid time inputs' })
  hoursDetails: TimeDTO[];
  @Type(() => TimeDTO)
  @ValidateNested({ each: true })
  @Validate(TimeRule, { message: 'Invalid time inputs' })
  onCall: TimeDTO[];
  note: string;
  note1: string;
  note2: string;
}

export class DeleteStandardDetailsDTO {
  @IsNotEmpty({ message: 'element id should not be empty' })
  @IsObjectId({ message: 'elementId should not be proper id' })
  elementId: ObjectId;
  @IsNotEmpty({ message: 'file id should not be empty' })
  @IsObjectId({ message: 'file should not be proper id' })
  fileId: ObjectId;
}

export class RegistrarDetail extends RegistrarDetailsDTO {
  name: string;
}

export class SupervisorDetailsDTO {
  userId: number | IUser;
  @Matches(/^(\+\d{1,3}[- ]?)?\d{9,12}$/, { message: 'Invalid contact number' })
  contactNumber: string;
  categoryOfSupervisor: string;
  isFormA1Complete: boolean;
  isNotify: boolean;
  status: boolean;
  @Type(() => TimeDTO)
  @ValidateNested({ each: true })
  @Validate(TimeRule, { message: 'Invalid time inputs' })
  hours: TimeDTO[];
  college: Array<college>;
}

export class GetSupervisorDetails {
  userId: number | IUser;
  username: string;
  email: string;
  contactNumber: string;
  categoryOfSupervisor: string;
  college: Array<college>;
  hours: Array<TimeDTO>;
}
export class PracticeStandardsDTO {
  _id: ObjectId;
  @IsNotEmpty({ message: 'Practice Standards title should not be empty' })
  title: string;
  @IsNotEmpty({ message: 'Practice Standards status should not be empty' })
  status: string;
  isFileUploadAllowed: boolean;
  isRemark: boolean;
  allowedFileTypes: string[];
  allowedFileMimeTypes: string[];
  list: string[];
  filePath: Array<fileDetal>;
  remarks: string;
}

export class fileDetal {
  _id: ObjectId;
  fileUrl: string;
  fileName: string;
}

export enum FormStatus {
  'Pending' = 'Pending',
  'Complete' = 'Complete',
  'ReSubmit' = 'ReSubmit',
  'Cancelled' = 'Cancelled',
}
