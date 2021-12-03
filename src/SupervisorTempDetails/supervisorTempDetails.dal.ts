import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { SupervisorTempDetailDTO } from './supervisorTempDetails.dto';
import { ISupervisorTempDetails } from './supervisorTempDetails.interface';

@Injectable()
export class SupervisorTempDetailDAL {
  constructor(
    @InjectModel('supervisorTempDetail')
    private readonly supervisorTempDetailModel: Model<ISupervisorTempDetails>,
  ) { }

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

  async getDeleteFileUpload(fileId: ObjectId): Promise<ISupervisorTempDetails> {
    return await this.supervisorTempDetailModel.findOne({
      'supervisorDetails.standardsDetail.filePath._id': fileId,
    });
  }

  async updateDetails(fileId: ObjectId) {
    await this.supervisorTempDetailModel.updateMany(
      { 'supervisorDetails.standardsDetail.filePath._id': fileId },
      {
        $pull: {
          'supervisorDetails.standardsDetail.$[].filePath': {
            _id: fileId,
          },
        },
      },
    );
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
