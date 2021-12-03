import { Injectable } from '@nestjs/common';
import { ObjectId } from 'mongoose';
import { SupervisorDetailsDTOA1 } from 'src/FormA1/formA1.dto';
import { SupervisorTempDetailDAL } from './supervisorTempDetails.dal';
import { SupervisorTempDetailDTO } from './supervisorTempDetails.dto';
import { ISupervisorTempDetails } from './supervisorTempDetails.interface';
@Injectable()
export class SupervisorTempDetailService {
  constructor(private supervisorTempDetailDAL: SupervisorTempDetailDAL) {}

  async submitSupervisorDetail(
    accreditionId: ObjectId,
    supervisor: SupervisorDetailsDTOA1,
  ): Promise<void> {
    const supervisorDetails =
      await this.supervisorTempDetailDAL.getSupervisorTempDetailsByAccreditionId(
        accreditionId,
      );
    if (supervisorDetails.length == 0 || supervisorDetails == null) {
      const details = new SupervisorTempDetailDTO();
      details.accreditionId = accreditionId;
      details.supervisorDetails = supervisor;
      await this.supervisorTempDetailDAL.addSupervisorTempDetails(details);
    } else {
      const existingSupervisor = supervisorDetails.filter(
        (x) => x.supervisorDetails.userId == supervisor.userId,
      );
      if (existingSupervisor.length > 0) {
        existingSupervisor[0].supervisorDetails.contactNumber =
          supervisor.contactNumber;
        existingSupervisor[0].supervisorDetails.hours = supervisor.hours;
        existingSupervisor[0].supervisorDetails.standardsDetail =
          supervisor.standardsDetail;
        existingSupervisor[0].supervisorDetails.isFormA1Complete = true;
        existingSupervisor[0].supervisorDetails.isAgree = supervisor.isAgree;
        await this.supervisorTempDetailDAL.updateSupervisorTempDetails(
          existingSupervisor[0]._id,
          existingSupervisor[0],
        );
      }
    }
  }

  async updateSupervisorTempDetails(
    id: ObjectId,
    supervisor: ISupervisorTempDetails,
  ) {
    await this.supervisorTempDetailDAL.updateSupervisorTempDetails(
      id,
      supervisor,
    );
  }

  async getSupervisorTempDetailsByAccreditionId(
    accreditionId: ObjectId,
    userId: number,
  ) {
    const data =
      await this.supervisorTempDetailDAL.getSupervisorTempDetailsByAccreditionId(
        accreditionId,
      );
    if (data == null || data.length == 0) {
      return null;
    } else {
      return data.filter((x) => x.supervisorDetails.userId == userId);
    }
  }

  async getSupervisorTempDetailsFromFileId(fileId: ObjectId) {
    const data = await this.supervisorTempDetailDAL.getDeleteFileUpload(fileId);
    if (data === null) {
      return null;
    } else {
      return data;
    }
  }

  async updateStandardsFileTempDetails(fileId: ObjectId) {
    await this.supervisorTempDetailDAL.updateDetails(fileId);
  }

  async deleteSupervisorDetail(
    accreditionId: ObjectId,
    userId: number,
  ): Promise<void> {
    const existingObject =
      await this.supervisorTempDetailDAL.getSupervisorTempDetailsByAccreditionId(
        accreditionId,
      );

    const isDelete = existingObject.some(
      (x) => x.supervisorDetails.userId == userId,
    );

    if (isDelete) {
      await this.supervisorTempDetailDAL.deleteSupervisorTempDetails(
        accreditionId,
      );
    }
  }
}
