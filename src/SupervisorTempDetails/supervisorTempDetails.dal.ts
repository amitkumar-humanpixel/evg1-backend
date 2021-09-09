import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { SupervisorDetailsDTOA1 } from 'src/FormA1/formA1.dto';
import { SupervisorTempDetailDTO } from './supervisorTempDetails.dto';
import { ISupervisorTempDetails } from './supervisorTempDetails.interface';

@Injectable()
export class SupervisorTempDetailDAL {
  constructor(
    @InjectModel('supervisorTempDetail')
    private readonly supervisorTempDetailModel: Model<ISupervisorTempDetails>,
  ) {}

  async addSupervisorTempDetails(
    supervisor: SupervisorTempDetailDTO,
  ): Promise<string> {
    const newFormA1 = new this.supervisorTempDetailModel(supervisor);
    await newFormA1.save();
    return newFormA1.id;
  }

  async getSupervisorTempDetailsByAccreditionId(
    accreditionId: ObjectId,
  ): Promise<ISupervisorTempDetails[]> {
    return await this.supervisorTempDetailModel.find({
      accreditionId: accreditionId,
    });
  }

  async updateSupervisorTempDetails(
    id: ObjectId,
    supervisor: ISupervisorTempDetails,
  ) {
    await this.supervisorTempDetailModel.updateOne({ _id: id }, supervisor);
  }

  async deleteSupervisorTempDetails(id: ObjectId) {
    await this.supervisorTempDetailModel.deleteOne({ accreditionId: id });
  }
}
