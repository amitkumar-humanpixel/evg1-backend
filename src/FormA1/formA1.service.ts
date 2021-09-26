import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { ObjectId } from 'mongoose';
import { AccreditionService } from 'src/Accredition/accredition.service';
import { FormStatus, GetSupervisorDetails } from 'src/FormA/formA.dto';
import { FormAService } from 'src/FormA/formA.service';
import { applicationsDTO, assessmentDTO, FormBDTO } from 'src/FormB/formB.dto';
import { FormBService } from 'src/FormB/formB.service';
import { FormA1DAL } from './formA1.dal';
import {
  finalCheckListDetailsDTO,
  FormA1DTO,
  GetSupervisorDetail,
  SupervisorDetailsDTOA1,
} from './formA1.dto';
import { IFormA1 } from './formA1.interface';
import { mailSender } from 'src/Listeners/mail.listener';
import { UserService } from 'src/User/user.service';
import { SupervisorTempDetailService } from 'src/SupervisorTempDetails/supervisorTempDetails.service';
@Injectable()
export class FormA1Service {
  constructor(
    private readonly formA1DAL: FormA1DAL,
    @Inject(forwardRef(() => FormAService))
    private readonly formAService: FormAService,
    @Inject(forwardRef(() => AccreditionService))
    private readonly accreditionService: AccreditionService,
    @Inject(forwardRef(() => FormBService))
    private readonly formBService: FormBService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private readonly tempSupervisorDetail: SupervisorTempDetailService,
  ) { }

  async getSupervisors(
    id: ObjectId,
    userId: number,
  ): Promise<GetSupervisorDetails> {
    const data = await this.formAService.getFormASupervisorsByAccreditionId(id);
    const responseData = data.find((x) => x.userId === userId);
    return responseData;
  }

  async getFormA1ByAccreditionId(accreditionId: ObjectId) {
    return await this.formA1DAL.getFormA1ByAccreditionId(accreditionId);
  }

  async deleteSupervisorDetails(accreditionId: ObjectId, userId: number) {
    await this.formA1DAL.deleteSupervisor(accreditionId, userId);
  }

  async addFormA1ByAccreditionId(formA1: FormA1DTO) {
    await this.formA1DAL.addFormA1(formA1);
  }

  async updateFormA1ByAccreditionId(formA1: IFormA1) {
    await this.formA1DAL.updateFormA1(formA1._id, formA1);
  }

  async submitSupervisorDetail(
    accreditionId: ObjectId,
    supervisor: SupervisorDetailsDTOA1,
  ): Promise<void> {
    this.tempSupervisorDetail.deleteSupervisorDetail(
      accreditionId,
      supervisor.userId as number,
    );
    const objFormA1 = await this.formA1DAL.getFormA1ByAccreditionId(
      accreditionId,
    );

    // due to bug is generated this code is added.
    if (objFormA1.supervisorDetails.length > 0) {
      const existingSupervisor = objFormA1.supervisorDetails.find(
        (x) => x.userId === supervisor.userId,
      );

      if (existingSupervisor === undefined) {
        const objSupervisorDetails = new SupervisorDetailsDTOA1();
        objSupervisorDetails.userId = supervisor.userId;
        objSupervisorDetails.contactNumber = supervisor.contactNumber;
        objSupervisorDetails.categoryOfSupervisor =
          supervisor.categoryOfSupervisor;
        objSupervisorDetails.isFormA1Complete = supervisor.isFormA1Complete;
        objSupervisorDetails.isAgree = supervisor?.isAgree ?? true;

        objFormA1.supervisorDetails.push(objSupervisorDetails);
      }
    }

    for (let index = 0; index < objFormA1.supervisorDetails.length; index++) {
      if (objFormA1.supervisorDetails[index].userId == supervisor.userId) {
        objFormA1.supervisorDetails[index].contactNumber =
          supervisor.contactNumber;
        // objFormA1.supervisorDetails[index].hours = supervisor.hours;
        objFormA1.supervisorDetails[index].standardsDetail =
          supervisor.standardsDetail;
        objFormA1.supervisorDetails[index].isFormA1Complete = true;
        objFormA1.supervisorDetails[index].isAgree = supervisor.isAgree;
      }
    }

    await this.formA1DAL.updateFormA1(objFormA1._id, objFormA1);
    await this.accreditionService.completeSupervisorDetails(
      objFormA1.accreditionId as ObjectId,
      supervisor.userId.toString(),
    );

    const FormA1Data = await this.formA1DAL.getFormA1ByAccreditionId(
      accreditionId,
    );
    const isMailSend = FormA1Data.supervisorDetails.every(
      (x) => x.isFormA1Complete === true,
    );
    if (isMailSend) {
      const practiceManagerData =
        await this.formAService.getPracticeManagerData(accreditionId);
      const accredition = await this.accreditionService.getAccreditionById(
        accreditionId,
      );
      for (let i = 0; i < practiceManagerData.length; i++) {
        const link =
          process.env.BASE_URL +
          process.env.FORM_COMPLETE_PARTA1 +
          `?id=${accreditionId}`;
        const practiceManagerDetails = practiceManagerData[i];
        const name = practiceManagerDetails[i].name.split(' ');
        mailSender(
          practiceManagerDetails[i].email,
          name[0],
          name[1],
          accredition.facilityName,
          'Complete Part A1',
          link,
        );
      }
    }
    // if (isMailSend) {
    //   const practiceManagerData =
    //     await this.formAService.getPracticeManagerFullData(accreditionId);
    //   for (let i = 0; i < practiceManagerData.length; i++) {
    //     const practiceManagerDetails: any[] =
    //       await this.userService.getUserAndFacilityDetails(
    //         practiceManagerData[i].userId,
    //       );
    //     for (let j = 0; j < practiceManagerDetails.length; j++) {
    //       mailSender(
    //         practiceManagerDetails[j].email,
    //         practiceManagerDetails[j].firstName,
    //         practiceManagerDetails[j].lastName,
    //         practiceManagerDetails[j].facility.practiceName,
    //         'Complete Part A1',
    //         'link',
    //       );
    //     }
    //   }
    // }
  }

  async submitTempSupervisorDetail(
    accreditionId: ObjectId,
    supervisor: SupervisorDetailsDTOA1,
  ) {
    console.log(supervisor);
    await this.tempSupervisorDetail.submitSupervisorDetail(
      accreditionId,
      supervisor,
    );
  }

  async getSupervisorsDetails(
    id: ObjectId,
    userId: number,
  ): Promise<GetSupervisorDetail> {
    const tempDetails =
      await this.tempSupervisorDetail.getSupervisorTempDetailsByAccreditionId(
        id,
        userId,
      );
    const response = new GetSupervisorDetail();
    if (tempDetails.length == 0) {
      console.log(id);
      const responseData = await this.formA1DAL.getSupervisorsDetails(id);
      if (responseData !== null) {
        const userData = responseData.supervisorDetails.find(
          (x) => x.userId == userId,
        );
        // response.hours = userData?.hours ?? undefined;
        response.userId = userData?.userId ?? undefined;
        response.categoryOfSupervisor = userData?.categoryOfSupervisor ?? '';
        response.standardsDetail = userData?.standardsDetail ?? undefined;
        response.contactNumber = userData?.contactNumber ?? '';
        response.isAgree = userData?.isAgree ?? false;
      }
    } else {
      const details = tempDetails[0];
      // response.hours = details?.supervisorDetails?.hours ?? undefined;
      response.userId = details?.supervisorDetails?.userId ?? undefined;
      response.categoryOfSupervisor =
        details?.supervisorDetails?.categoryOfSupervisor ?? '';
      response.standardsDetail =
        details?.supervisorDetails?.standardsDetail ?? undefined;
      response.contactNumber = details?.supervisorDetails?.contactNumber ?? '';
      response.isAgree = details?.supervisorDetails?.isAgree ?? false;
    }

    return response;
  }
  async getFinalCheckList(id: ObjectId): Promise<any> {
    const responseData = await this.formA1DAL.getFormA1FinalCheckListData(id);
    return responseData;
  }
  async submitFinalCheckListDetails(
    accreditionId: ObjectId,
    finalCheckListDetails: finalCheckListDetailsDTO,
  ): Promise<void> {
    const objFormA1 = await this.formA1DAL.getFormA1ByAccreditionId(
      accreditionId,
    );

    // objFormA1.finalCheckList = finalCheckListDetails.finalCheckLists;
    objFormA1.addressRecommendation.actioned = finalCheckListDetails.actioned;
    objFormA1.addressRecommendation.recommendation =
      finalCheckListDetails.recommendation;
    objFormA1.status = FormStatus['Complete'];

    await this.formA1DAL.updateFormA1(objFormA1._id, objFormA1);

    await this.accreditionService.completeFormA1(
      objFormA1.accreditionId as ObjectId,
    );

    // await this.accreditionService.completeFinalCheckList(
    //   objFormA1.accreditionId as ObjectId,
    //   'Final CheckList',
    // );
    await this.accreditionService.completeAddressRecommendation(
      objFormA1.accreditionId as ObjectId,
    );
    const formB = await this.formBService.getFormBByAccreditionId(
      objFormA1.accreditionId as ObjectId,
    );
    if (formB == null) {
      const objFormB = new FormBDTO();
      objFormB.addFormB(
        objFormA1.accreditionId as ObjectId,
        objFormA1.formAId as ObjectId,
        objFormA1._id as ObjectId,
      );
      objFormB.applications = [];
      const accredition = await this.accreditionService.getAccreditionById(
        objFormA1.accreditionId as ObjectId,
      );
      for (let index = 0; index < objFormA1.supervisorDetails.length; index++) {
        const app = new applicationsDTO();
        const element = objFormA1.supervisorDetails[index];
        app.supervisorId = element.userId;
        if (accredition.college === 'RACGP') {
          app.RACGP = 'true';
        } else {
          app.ACRRM = 'true';
        }
        objFormB.applications.push(app);
      }
      await this.formBService.addFormB(objFormB);
    }
    if (!objFormA1.isNotify) {
      let isNotify = false;
      // need to check code
      const users = await this.userService.getASCData();
      const practiceDetails = await this.accreditionService.getAccreditionById(
        objFormA1.accreditionId as ObjectId,
      );
      // const accreditationSupportCoordinatorData =
      //   await this.accreditionService.getAccreditationSupportCoordinatorData(
      //     accreditionId,
      //   );

      // const accreditationSupportCoordinatorDetails =
      //   accreditationSupportCoordinatorData.filter((data) => {
      //     return (
      //       data.userDetails.role.toLowerCase() ===
      //       'accreditation_support_coordinator'
      //     );
      //   });
      for (let i = 0; i < users.length; i++) {
        const link =
          process.env.BASE_URL +
          process.env.FORM_SUBMIT +
          `?id=${accreditionId}`;
        mailSender(
          users[i].email,
          users[i].firstName,
          users[i].lastName,
          practiceDetails.facilityName,
          'Form Submitted',
          link,
        );
        isNotify = true;
      }
      objFormA1.isNotify = isNotify;
      await this.formA1DAL.updateFormA1(objFormA1._id, objFormA1);
    }
  }

  async resubmitForm(id: ObjectId) {
    const accredition =
      await this.accreditionService.getAccreditionByAccreditionId(id);
    accredition.status = 'INCOMPLETE';
    accredition.isFormAComplete = false;

    accredition.formA.map((x) => (x.isComplete = false));

    await this.accreditionService.updateAccreditionByAccreditionId(accredition);

    const objFormA1 = await this.formA1DAL.getFormA1ByAccreditionId(id);
    objFormA1.isNotify = false;
    objFormA1.status = FormStatus['ReSubmit'];

    await this.formA1DAL.updateFormA1(objFormA1._id, objFormA1);

    const practiceManager = await this.formAService.getPracticeManagerData(id);
    const practiceDetails = await this.accreditionService.getAccreditionById(
      id,
    );
    const name = practiceManager.name.split(' ');
    const link = process.env.BASE_URL + process.env.FORM_READY + `?id=${id}`;
    mailSender(
      practiceManager.email,
      name[0],
      name[1],
      practiceDetails.facilityName,
      'Form Re-Submitted',
      link,
    );
  }

  async deleteFileUpload(id: ObjectId, path: string) {
    await this.formA1DAL.deleteFileUpload(id, path);
  }
}
