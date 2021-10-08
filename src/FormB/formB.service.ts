import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { ObjectId } from 'mongoose';
import { AccreditionService } from 'src/Accredition/accredition.service';
import { FacilityStaffDAL } from 'src/FacilityStaff/facilityStaff.dal';
import { GetFacilityStaffUser } from 'src/FacilityStaff/facilityStaff.dto';
import { FormAService } from 'src/FormA/formA.service';
import { mailSender } from 'src/Listeners/mail.listener';
import { UserService } from 'src/User/user.service';
import { FormBDAL } from './formB.dal';
import {
  accreditorDetails,
  applicationsDetailDTO,
  applicationsDTO,
  AssignAccreditorDetailDTO,
  FormBDTO,
  OtherDetailsDTO,
  SummaryDataDTO,
  SummaryDTO,
} from './formB.dto';
import { IFormB } from './formB.interface';

@Injectable()
export class FormBService {
  constructor(
    private formBDAL: FormBDAL,
    private facilityStaffDAL: FacilityStaffDAL,
    @Inject(forwardRef(() => FormAService))
    private formAService: FormAService,
    @Inject(forwardRef(() => AccreditionService))
    private accreditionService: AccreditionService,
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
  ) { }

  async getAccreditors(facilityId: number): Promise<GetFacilityStaffUser[]> {
    let supervisors =
      await this.facilityStaffDAL.getFacilityAccreditorByFacilityId(facilityId);
    if (supervisors.length === 0) {
      supervisors = await this.userService.getAccreditors();
    }
    const users = new Array<GetFacilityStaffUser>();
    supervisors.map((supervisor) => {
      const user = new GetFacilityStaffUser();
      user.firstName = supervisor?.user?.firstName ?? '';
      user.lastName = supervisor?.user?.lastName ?? '';
      user.email = supervisor?.user?.email ?? '';
      user.role = supervisor?.user?.role ?? undefined;
      user.userId = supervisor?.userId ?? undefined;
      users.push(user);
    });

    return users;
  }

  async getAccreditorDetails(
    accreditionId: ObjectId,
  ): Promise<GetFacilityStaffUser> {
    const formB = await this.formBDAL.getFormBByAccreditionId(accreditionId);
    const user = new GetFacilityStaffUser();
    if (formB.accreditorId) {
      const supervisors = await this.userService.getUserByUserId(
        formB.accreditorId,
      );

      user.firstName = supervisors.firstName;
      user.lastName = supervisors.lastName;
      user.email = supervisors.email;
      user.role = supervisors.role;
      user.userId = supervisors.userId;
    }

    return user;
  }

  async getSupervisors(id: ObjectId) {
    return await this.formAService.getFormASupervisorsByAccreditionId(id);
  }

  async getFormBByAccreditionIdAndId(accreditionId: ObjectId, id: ObjectId) {
    return await this.formBDAL.getFormBByAccreditionIdAndFormAId(
      accreditionId,
      id,
    );
  }

  async getFormBByAccreditionId(accreditionId: ObjectId) {
    return await this.formBDAL.getFormBByAccreditionId(accreditionId);
  }

  async findAndUpdateFormBByAccreditionId(
    accreditionId: ObjectId,
    formB: FormBDTO,
  ) {
    await this.formBDAL.findAndUpdateFormBByAccreditionId(accreditionId, formB);
  }

  async addFormB(formB: FormBDTO) {
    await this.formBDAL.addFormB(formB);
  }

  async submitAssignedAccriditor(
    accreditionId: ObjectId,
    accreditor: AssignAccreditorDetailDTO,
  ) {
    const formB = await this.formBDAL.getFormBByAccreditionIdId(accreditionId);
    formB.accreditorId = accreditor.accreditorId;
    await this.formBDAL.updateFormB(formB._id, formB);
    await this.accreditionService.completeFormBSteps(
      formB.accreditionId as ObjectId,
      'Assign Accreditor',
    );
    await this.accreditionService.addAccredition(
      formB.accreditionId as ObjectId,
      accreditor.accreditorId as number,
    );
    if (!formB.isNotify) {
      const userDetails = await this.userService.getUserByUserId(
        accreditor.accreditorId,
      );
      const practiceDetails = await this.accreditionService.getAccreditionById(
        formB.accreditionId as ObjectId,
      );

      const link =
        process.env.BASE_URL +
        process.env.FORM_COMPLETE_PARTB +
        `?id=${formB.accreditionId}`;
      mailSender(
        userDetails.email,
        userDetails.firstName,
        userDetails.lastName,
        practiceDetails.facilityName,
        'Complete Part B',
        link,
      );
      formB.isNotify = true;
      await this.formBDAL.updateFormB(formB._id, formB);
    }
  }

  async submitSummary(
    accreditionId: ObjectId,
    summary: SummaryDTO,
  ): Promise<void> {
    const formB = await this.formBDAL.getFormBByAccreditionIdId(accreditionId);

    formB.accreditorId = summary.accreditorId;
    formB.accreditationWithEV = summary.accreditationWithEV;
    formB.classification = summary.classification;
    formB.dateOfVisit = summary.dateOfVisit;
    formB.dateOfReportComplete = summary.dateOfReportComplete;
    formB.assessment = summary.assessment;
    formB.applications = summary.applications;
    formB.practiceDetail = summary.practiceDetail;
    await this.formBDAL.updateFormB(formB._id, formB);
    await this.accreditionService.completeFormBSteps(
      formB.accreditionId as ObjectId,
      'Summary',
    );
    await this.accreditionService.completeAllFormB(
      formB.accreditionId as ObjectId,
    );
  }

  async submitOtherDetails(
    accreditionId: ObjectId,
    otherDetails: OtherDetailsDTO,
  ): Promise<void> {
    const formB = await this.formBDAL.getFormBByAccreditionIdId(accreditionId);
    formB.previousIssues = otherDetails.previousIssues;
    formB.summery = otherDetails.summery;
    formB.recomendationPanel = otherDetails.recomendationPanel;
    formB.reviewedBy = otherDetails.reviewedBy;
    formB.isAgree = otherDetails.isAgree;
    formB.isCompleted = true;

    await this.formBDAL.updateFormB(formB._id, formB);
    await this.accreditionService.completeFormBSteps(
      formB.accreditionId as ObjectId,
      'Declaration',
    );
    await this.accreditionService.completeAllFormB(
      formB.accreditionId as ObjectId,
    );
    await this.accreditionService.completeFormB(
      formB.accreditionId as ObjectId,
    );

    if (!formB.isUserNotify) {
      const users = await this.userService.getSuperAdmins();
      const ascUsers = await this.userService.getASCUsers();

      await this.sentMail(users, formB.accreditionId as ObjectId);
      await this.sentMail(ascUsers, formB.accreditionId as ObjectId);
      formB.isUserNotify = true;
    }
    await this.formBDAL.updateFormB(formB._id, formB);
  }

  async sentMail(users: any, accreditionId: ObjectId) {
    for (let index = 0; index < users.length; index++) {
      const element = users[index];
      const userDetails = await this.userService.getUserByUserId(
        element.userId,
      );
      const practiceDetails = await this.accreditionService.getAccreditionById(
        accreditionId,
      );

      const link =
        process.env.BASE_URL +
        process.env.FORM_COMPLETE_PARTB +
        `?id=${accreditionId}`;
      mailSender(
        userDetails.email,
        userDetails.firstName,
        userDetails.lastName,
        practiceDetails.facilityName,
        'Complete All Forms',
        link,
      );
    }
  }

  async getSummary(id: ObjectId): Promise<SummaryDataDTO> {
    let data = await this.formBDAL.getSummary(id);
    data = data[0];
    const response = new SummaryDataDTO();
    response.accreditationWithEV = data?.accreditationWithEV ?? false;
    let accreditor = null;
    if (data?.accreditorId != undefined ?? false) {
      accreditor = await this.userService.getUserByUserId(data.accreditorId);
    }

    response.accreditorDetails = new accreditorDetails();
    response.accreditorDetails.userId = accreditor?.userId ?? undefined;
    response.accreditorDetails.name = `${accreditor?.firstName ?? ''} ${accreditor?.lastName ?? ''
      }`;
    response.assessment = data?.assessment ?? [];
    response.classification = data?.classification ?? '';
    response.dateOfVisit = data?.dateOfVisit ?? '';
    response.dateOfReportComplete = data?.dateOfReportComplete ?? '';
    response.practiceDetail = data?.practiceDetail ?? '';
    response.applications = new Array<applicationsDTO>();
    for (let index = 0; index < data?.applications.length ?? 0; index++) {
      const element = data.applications[index];
      const application = new applicationsDetailDTO();
      application.ACRRM = element.ACRRM;
      application.RACGP = element.RACGP;
      application.supervisorId = element.supervisorId;
      application.consideration = element.consideration;
      application.remarks = element.remarks;
      application.isFormRegistrar = element.isFormRegistrar;
      let supervisorData = data.supervisor.find(
        (x) => x.userId == element.supervisorId,
      );
      application.name = `${supervisorData.firstName} ${supervisorData.lastName}`;
      supervisorData = data.formA.supervisorDetails.find(
        (x) => x.userId == element.supervisorId,
      );
      application.categoryOfSupervisor = `${supervisorData?.categoryOfSupervisor ?? ''
        }`;

      response.applications.push(application);
    }
    return response;
  }

  async getOtherDetails(id: ObjectId): Promise<IFormB> {
    return await this.formBDAL.getOtherDetails(id);
  }
}
