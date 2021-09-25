import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, ValidateNested } from 'class-validator';
import { ObjectId } from 'mongoose';
import { college } from 'src/Accredition/accredition.dto';
import { IAccredition } from 'src/Accredition/accredition.interface';
import { IFacilityStaff } from 'src/FacilityStaff/facilityStaff.interface';
import { IUser } from 'src/User/user.interface';

export class PracticeManagerDTO {
  @IsNotEmpty({ message: 'User Id should not be empty' })
  @IsNumber({ allowNaN: false }, { message: 'User Id should not be empty' })
  userId: number;
  @IsNotEmpty({ message: 'Contact Number should not be empty' })
  contactNumber: string;
  usualWorkingHours: WorkingHoursDTO;
  @Type(() => TimeDTO)
  @ValidateNested({ each: true })
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
  hoursDetails: TimeDTO[];
  onCall: TimeDTO[];
  note: string;
  note1: string;
  note2: string;
}

export class RegistrarDetail extends RegistrarDetailsDTO {
  name: string;
}

export class SupervisorDetailsDTO {
  userId: number | IUser;
  contactNumber: string;
  categoryOfSupervisor: string;
  isFormA1Complete: boolean;
  isNotify: boolean;
  status: boolean;
  hours: Array<TimeDTO>;
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
  @IsNotEmpty({ message: 'Practice Standards title should not be empty' })
  title: string;
  @IsNotEmpty({ message: 'Practice Standards status should not be empty' })
  status: string;
  filePath: Array<fileDetal>;
  remarks: string;
}

export class fileDetal {
  fileUrl: string;
  fileName: string;
}

export enum FormStatus {
  'Pending' = 'Pending',
  'Complete' = 'Complete',
  'ReSubmit' = 'ReSubmit',
  'Cancelled' = 'Cancelled',
}
