import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { ObjectId } from 'mongoose';
import { AccreditionService } from 'src/Accredition/accredition.service';
import { SupervisorDetailsDTOA1 } from 'src/FormA1/formA1.dto';
import { UserService } from 'src/User/user.service';
import { SupervisorTempDetailDAL } from './supervisorTempDetails.dal';
import { SupervisorTempDetailDTO } from './supervisorTempDetails.dto';
@Injectable()
export class SupervisorTempDetailService {
  constructor(
    private supervisorTempDetailDAL: SupervisorTempDetailDAL,
    @Inject(forwardRef(() => AccreditionService))
    private accreditionService: AccreditionService,
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
  ) { }

  async submitSupervisorDetail(
    accreditionId: ObjectId,
    supervisor: SupervisorDetailsDTOA1,
  ): Promise<void> {
    const supervisorDetails =
      await this.supervisorTempDetailDAL.getSupervisorTempDetailsByAccreditionId(
        accreditionId,
      );
    console.log(supervisorDetails);
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

  async getSupervisorTempDetailsByAccreditionId(
    accreditionId: ObjectId,
    userId: number,
  ) {
    const data =
      await this.supervisorTempDetailDAL.getSupervisorTempDetailsByAccreditionId(
        accreditionId,
      );
    if (data == null) {
      return null;
    } else {
      return data.filter((x) => x.supervisorDetails.userId == userId);
    }
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
