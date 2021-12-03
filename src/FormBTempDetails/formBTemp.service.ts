import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { ObjectId } from 'mongoose';
import { FormAService } from 'src/FormA/formA.service';
import { UserService } from 'src/User/user.service';
import {
  accreditorDetails,
  applicationsDetailDTO,
  applicationsDTO,
  FormBDTO,
  OtherDetailsDTO,
  OtherDetailsTempDTO,
  SummaryDataDTO,
  SummaryTempDTO,
} from '../FormB/formB.dto';
import { FormBTempDAL } from './formBTemp.dal';
import { IFormBTemp } from './formBTemp.interface';

@Injectable()
export class FormBTempService {
  constructor(
    private formBTempDAL: FormBTempDAL,
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
    @Inject(forwardRef(() => FormAService))
    private formAService: FormAService,
  ) {}

  async addFormB(formB: FormBDTO) {
    await this.formBTempDAL.addFormB(formB);
  }

  async submitAssignedAccriditor(
    accreditionId: ObjectId,
    accreditorId: number,
  ) {
    let formB = await this.formBTempDAL.getFormBByAccreditionIdId(
      accreditionId,
    );

    if (formB === null) {
      const formAData = await this.formAService.getFormADetailsByAccreditionId(
        accreditionId as ObjectId,
      );
      const newFormB = new FormBDTO();
      newFormB.accreditionId = accreditionId;
      newFormB.formAId = formAData._id;
      newFormB.accreditorId = accreditorId;
      await this.addFormB(newFormB);
      formB = await this.formBTempDAL.getFormBByAccreditionIdId(accreditionId);
    }
    formB.accreditorId = accreditorId;
    await this.formBTempDAL.updateFormB(formB._id, formB);
  }

  async submitSummary(
    accreditionId: ObjectId,
    summary: SummaryTempDTO,
  ): Promise<void> {
    let formB = await this.formBTempDAL.getFormBByAccreditionIdId(
      accreditionId,
    );

    if (formB === null) {
      const formAData = await this.formAService.getFormADetailsByAccreditionId(
        accreditionId as ObjectId,
      );
      const newFormB = new FormBDTO();
      newFormB.accreditionId = accreditionId;
      newFormB.formAId = formAData._id;
      await this.addFormB(newFormB);
      formB = await this.formBTempDAL.getFormBByAccreditionIdId(accreditionId);
    }

    formB.accreditorId = summary.accreditorId;
    formB.accreditationWithEV = summary.accreditationWithEV;
    formB.classification = summary.classification;
    formB.dateOfVisit = summary.dateOfVisit;
    formB.dateOfReportComplete = summary.dateOfReportComplete;
    formB.assessment = summary.assessment;
    formB.applications = summary.applications;
    formB.practiceDetail = summary.practiceDetail;
    await this.formBTempDAL.updateFormB(formB._id, formB);
  }

  async completeSummary(accreditionId: ObjectId) {
    const formB = await this.formBTempDAL.getFormBByAccreditionIdId(
      accreditionId,
    );
    formB.isSummaryComplete = true;
    if (formB.isSummaryComplete && formB.isDeclarationComplete) {
      await this.formBTempDAL.deleteFormBTempDetails(accreditionId);
    } else {
      await this.formBTempDAL.updateFormB(formB._id, formB);
    }
  }

  async completeDeclaration(accreditionId: ObjectId) {
    const formB = await this.formBTempDAL.getFormBByAccreditionIdId(
      accreditionId,
    );
    formB.isDeclarationComplete = true;
    if (formB.isSummaryComplete && formB.isDeclarationComplete) {
      await this.formBTempDAL.deleteFormBTempDetails(accreditionId);
    } else {
      await this.formBTempDAL.updateFormB(formB._id, formB);
    }
  }

  async submitOtherDetails(
    accreditionId: ObjectId,
    otherDetails: OtherDetailsTempDTO,
  ): Promise<void> {
    let formB = await this.formBTempDAL.getFormBByAccreditionIdId(
      accreditionId,
    );

    if (formB === null) {
      const newFormB = new FormBDTO();
      newFormB.accreditionId = accreditionId;
      await this.addFormB(newFormB);
      formB = await this.formBTempDAL.getFormBByAccreditionIdId(accreditionId);
    }

    formB.previousIssues = otherDetails.previousIssues;
    formB.summery = otherDetails.summery;
    formB.recomendationPanel = otherDetails.recomendationPanel;
    formB.reviewedBy = otherDetails.reviewedBy;
    formB.isAgree = otherDetails.isAgree;
    formB.isCompleted = true;

    await this.formBTempDAL.updateFormB(formB._id, formB);
  }

  async getSummary(id: ObjectId): Promise<SummaryDataDTO> {
    let data = await this.formBTempDAL.getSummary(id);
    if (data.length > 0) {
      data = data[0];
      const response = new SummaryDataDTO();
      response.accreditationWithEV = data?.accreditationWithEV ?? false;
      let accreditor = null;
      if (data?.accreditorId != undefined ?? false) {
        accreditor = await this.userService.getUserByUserId(data.accreditorId);
      }

      response.accreditorDetails = new accreditorDetails();
      response.accreditorDetails.userId = accreditor?.userId ?? undefined;
      response.accreditorDetails.name = `${accreditor?.firstName ?? ''} ${
        accreditor?.lastName ?? ''
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
        application.categoryOfSupervisor = `${
          supervisorData?.categoryOfSupervisor ?? ''
        }`;

        response.applications.push(application);
      }
      return response;
    } else {
      return null;
    }
  }

  async getOtherDetails(id: ObjectId): Promise<IFormBTemp> {
    return await this.formBTempDAL.getOtherDetails(id);
  }
}
