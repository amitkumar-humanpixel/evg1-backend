import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { ObjectId } from 'mongoose';
import { AccreditionService } from 'src/Accredition/accredition.service';
import { FacilityRegistrarService } from 'src/FacilityRegistrar/facilityRegistrar.service';
import { FacilityStaffDAL } from 'src/FacilityStaff/facilityStaff.dal';
import {
  GetFacilityStaffUser,
  GetRegistrarUser,
} from 'src/FacilityStaff/facilityStaff.dto';
import { FormA1DTO } from 'src/FormA1/formA1.dto';
import { FormA1Service } from 'src/FormA1/formA1.service';
import { FormADAL } from './formA.dal';
import {
  FormADTO,
  GetSupervisorDetails,
  PracticeManagementDTO,
  PracticeManagerDetails,
  PracticeManagerDTO,
  PracticeStandardsDTO,
  RegistrarDetail,
  RegistrarDetailsDTO,
  SupervisorDetailsDTO,
} from './formA.dto';
import { mailSender } from 'src/Listeners/mail.listener';
import { UserService } from 'src/User/user.service';
import { FacilityService } from 'src/Facility/facility.service';
@Injectable()
export class FormAService {
  constructor(
    private formADAL: FormADAL,
    private facilityStaffDAL: FacilityStaffDAL,
    @Inject(forwardRef(() => FormA1Service))
    private formA1Service: FormA1Service,
    @Inject(forwardRef(() => AccreditionService))
    private accreditionService: AccreditionService,
    @Inject(forwardRef(() => FacilityRegistrarService))
    private facilityRegistrarService: FacilityRegistrarService,
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
  ) {}

  async getPracticeManagers(
    facilityId: number,
  ): Promise<GetFacilityStaffUser[]> {
    const practiceMangers =
      await this.facilityStaffDAL.getFacilityPracticeManagerByFacilityId(
        facilityId,
      );
    const users = new Array<GetFacilityStaffUser>();
    practiceMangers.map((practiceManger) => {
      const user = new GetFacilityStaffUser();
      user.firstName = practiceManger.user.firstName;
      user.lastName = practiceManger.user.lastName;
      user.email = practiceManger.user.email;
      user.role = practiceManger.user.role;
      user.userId = practiceManger.userId;
      users.push(user);
    });
    return users;
  }

  async getSupervisors(facilityId: number): Promise<GetFacilityStaffUser[]> {
    const supervisors =
      await this.facilityStaffDAL.getFacilitySupervisorByFacilityId(facilityId);
    const users = new Array<GetFacilityStaffUser>();
    supervisors.map((supervisor) => {
      const user = new GetFacilityStaffUser();
      user.firstName = supervisor.user.firstName;
      user.lastName = supervisor.user.lastName;
      user.email = supervisor.user.email;
      user.role = supervisor.user.role;
      user.userId = supervisor.userId;
      users.push(user);
    });

    return users;
  }

  async getRegistrarUsers(facilityId: number): Promise<GetRegistrarUser[]> {
    const registrars =
      await this.facilityRegistrarService.getFacilityRegistrarByFacilityId(
        facilityId,
      );
    const users = new Array<GetRegistrarUser>();
    registrars.map((registrar) => {
      const user = new GetRegistrarUser();
      user.placementId = registrar.placementId;
      user.name = `${registrar.firstName} ${registrar.lastName}`;
      users.push(user);
    });

    return users;
  }

  async getPracticeManagerData(accreditionId: ObjectId): Promise<any> {
    const output =
      await this.formADAL.getFormAPracticeManagerDataByAccreditionId(
        accreditionId,
      );
    const practiceManagers = output[0];
    const users = new PracticeManagerDetails();
    users.userId = practiceManagers?.practiceManagerDetail?.userId ?? 0;
    users.contactNumber =
      practiceManagers?.practiceManagerDetail?.contactNumber ?? '';
    users.usualWorkingHours =
      practiceManagers?.practiceManagerDetail?.usualWorkingHours ?? {};
    users.hours = practiceManagers?.practiceManagerDetail?.hours ?? [];
    users.name = `${practiceManagers?.user?.firstName ?? ''} ${
      practiceManagers?.user?.lastName ?? ''
    }`;
    users.email = `${practiceManagers?.user?.email ?? ''}`;
    return users;
  }
  async getPracticeManagerFullData(accreditionId: ObjectId): Promise<any> {
    return await this.formADAL.getUserFullData(accreditionId);
  }
  async getAccreditorFullData(accreditionId: ObjectId): Promise<any> {
    return await this.formADAL.getUserFullData(accreditionId);
  }
  async getStandardDetails(accreditionId: ObjectId): Promise<any> {
    const formA = await this.formADAL.getFormAByAccreditionId(accreditionId);
    let standardDeatils = new Array<PracticeStandardsDTO>();
    standardDeatils = formA?.practiceStandards ?? [];
    return standardDeatils;
  }

  async getFormASupervisorsByAccreditionId(
    id: ObjectId,
  ): Promise<Array<GetSupervisorDetails>> {
    console.log(id);
    const supervisors = await this.formADAL.getFormASupervisorsByAccreditionId(
      id,
    );
    const response = [];
    for (let index = 0; index < supervisors.length; index++) {
      const element = supervisors[index];
      const supervisor = new GetSupervisorDetails();
      supervisor.userId = element.user.userId;
      supervisor.username = `${element.user.firstName} ${element.user.lastName}`;
      supervisor.email = element.user.email;
      supervisor.contactNumber = element.supervisorDetails.contactNumber;
      supervisor.categoryOfSupervisor =
        element.supervisorDetails.categoryOfSupervisor;
      response.push(supervisor);
    }

    return response;
  }

  async getRegistrarDetails(accreditionId: ObjectId): Promise<any> {
    const registrarDetails =
      await this.formADAL.getFormARegistrarDataByAccreditionId(accreditionId);
    const arrRegistrar = new Array<RegistrarDetail>();
    for (
      let index = 0;
      index < registrarDetails[0]?.registrarDetails?.length ?? 0;
      index++
    ) {
      const element = registrarDetails[0].registrarDetails[index];

      const registrar = new RegistrarDetail();
      registrar.hoursDetails = element.hoursDetails;
      registrar.onCall = element.onCall;
      registrar.note = element.note;
      registrar.placementId = element.placementId;
      registrar.name = `${registrarDetails[0].placement.firstName} ${registrarDetails[0].placement.lastName}`;

      arrRegistrar.push(registrar);
    }
    return arrRegistrar;
  }

  async submitPracticeManagerDetail(
    accreditionId: ObjectId,
    practiceManager: PracticeManagerDTO,
  ): Promise<string> {
    const existingFormA = await this.formADAL.getFormAByAccreditionId(
      accreditionId,
    );

    const objPracticeManager = new PracticeManagementDTO();
    objPracticeManager.addPracticeManagement(
      practiceManager.userId,
      practiceManager.contactNumber,
      practiceManager.usualWorkingHours,
      practiceManager.hours,
    );

    if (existingFormA == null) {
      const objFormA = new FormADTO();

      objFormA.addFormA(accreditionId, objPracticeManager);

      const response = await this.formADAL.addFormA(objFormA);
      await this.accreditionService.completeFormASteps(
        objFormA.accreditionId as ObjectId,
        'Practice Manager',
      );
      return response;
    } else {
      existingFormA.practiceManagerDetail = objPracticeManager;
      await this.formADAL.updateFormA(existingFormA._id, existingFormA);
      return existingFormA._id as unknown as string;
    }
  }

  async submitPracticeStandards(
    accreditionId: ObjectId,
    practiceStandards: PracticeStandardsDTO[],
  ) {
    const objFormA = await this.formADAL.getFormAByAccreditionId(accreditionId);
    objFormA.practiceStandards = practiceStandards;
    await this.formADAL.updateFormA(objFormA._id, objFormA);
    await this.accreditionService.completeFormASteps(
      objFormA.accreditionId as ObjectId,
      'Standards',
    );
  }

  async submitSupervisors(
    accreditionid: ObjectId,
    supervisorDetails: SupervisorDetailsDTO[],
  ) {
    // const updatedSupervisorDetails = [];
    // for (let index = 0; index < supervisorDetails.length; index++) {
    //   const element = supervisorDetails[index];
    //   if (!updatedSupervisorDetails.some((x) => x.userId === element.userId)) {
    //     updatedSupervisorDetails.push(element);
    //   }
    // }

    const objFormA = await this.formADAL.getFormAByAccreditionId(accreditionid);
    if (objFormA == null) {
      throw new BadRequestException(
        'Form A does not exists with give accredition id!',
      );
    }

    supervisorDetails.map((supervisor) => {
      const existingSupervisor = objFormA.supervisorDetails.filter(
        (x) => x.userId === supervisor.userId,
      );

      if (existingSupervisor.length > 0) {
        if (existingSupervisor[0].isNotify) {
          supervisor.isNotify = true;
        }
      }
    });

    objFormA.supervisorDetails = supervisorDetails;
    await this.formADAL.updateFormA(objFormA._id, objFormA);

    const formA1 = await this.formA1Service.getFormA1ByAccreditionId(
      objFormA.accreditionId as ObjectId,
    );

    const objFormA1 = new FormA1DTO();
    for (let index = 0; index < objFormA.supervisorDetails.length; index++) {
      const element = objFormA.supervisorDetails[index];
      objFormA1.addSupervisorsDetails(element);
    }

    if (formA1 == null) {
      objFormA1.addFormA1(objFormA.accreditionId as ObjectId, objFormA._id);

      await this.formA1Service.addFormA1ByAccreditionId(objFormA1);

      await this.accreditionService.completeFormASteps(
        objFormA.accreditionId as ObjectId,
        'Supervisor',
      );

      await this.accreditionService.addSupervisors(
        objFormA.accreditionId as ObjectId,
        [...supervisorDetails],
      );
    } else {
      formA1.supervisorDetails = objFormA1.supervisorDetails;
      await this.formA1Service.updateFormA1ByAccreditionId(formA1);

      await this.accreditionService.addSupervisors(
        objFormA.accreditionId as ObjectId,
        [...supervisorDetails],
      );
    }
  }

  async submitRegistrarDetails(
    id: ObjectId,
    registrarDetails: RegistrarDetailsDTO[],
  ) {
    const objFormA = await this.formADAL.getFormAByAccreditionId(id);
    objFormA.isCompleted = true;
    objFormA.registrarDetails = registrarDetails;

    await this.formADAL.updateFormA(objFormA._id, objFormA);

    await this.accreditionService.completeFormA(
      objFormA.accreditionId as ObjectId,
    );

    await this.accreditionService.completeFormASteps(
      objFormA.accreditionId as ObjectId,
      'Registrar',
    );
    let isUpdate = false;
    const practiceDetails = await this.accreditionService.getAccreditionById(
      objFormA.accreditionId as ObjectId,
    );
    for (let i = 0; i < objFormA.supervisorDetails.length; i++) {
      if (!objFormA.supervisorDetails[i].isNotify) {
        const supervisorData = await this.userService.getUserAndFacilityDetails(
          objFormA.supervisorDetails[i].userId as number,
        );
        const userData = supervisorData[0];
        const nameUser = await this.userService.getUserByUserId(
          userData.userId,
        );
        const link =
          process.env.BASE_URL +
          process.env.FORM_COMPLETE_PARTA +
          `${nameUser?.firstName.toLowerCase() ?? ''}${
            nameUser?.lastName.charAt(0).toUpperCase() +
              nameUser?.lastName.slice(1) ?? ''
          }/` +
          `?id=${id}&sid=${userData.userId}`;
        mailSender(
          userData.email,
          userData.firstName,
          userData.lastName,
          practiceDetails.facilityName,
          'Complete Part A',
          link,
        );
        objFormA.supervisorDetails[i].isNotify = true;
        isUpdate = true;
      }
    }

    if (isUpdate) {
      await this.formADAL.updateFormA(objFormA._id, objFormA);
    }
  }
  async deleteFileUpload(id: ObjectId, path: string) {
    this.formADAL.deleteFileUpload(id, path);
  }
}

// Mail Sending Function
//1) return mail sent to PM to review and submit
// const practiceManagerData =
//   await this.formAService.getPracticeManagerFullData(accreditionId);
// for (let i = 0; i < practiceManagerData.length; i++) {
//   mailSender(
//     practiceManagerData[i].user.email,
//     practiceManagerData[i].user.firstName,
//     practiceManagerData[i].user.lastName,
//     practiceManagerData[i].facilityDetails.practiceName,
//     'Form Requires Review',
//     'link',
//   );
// }

//2) success mail send to accreditor
// const accreditorData = await this.formAService.getAccreditorFullData(
//   accreditionId,
// );
// for (let i = 0; i < accreditorData.length; i++) {
//   mailSender(
//     accreditorData[i].user.email,
//     accreditorData[i].user.firstName,
//     accreditorData[i].user.lastName,
//     accreditorData[i].facilityDetails.practiceName,
//     'Form Ready',
//     'link',
//   );
// }
