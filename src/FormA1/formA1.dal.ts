import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { FormA1DTO } from './formA1.dto';
import { IFormA1 } from './formA1.interface';
@Injectable()
export class FormA1DAL {
  constructor(
    @InjectModel('formA1')
    private readonly formA1Model: Model<IFormA1>,
  ) { }
  async getSupervisorsDetails(accreditionId: ObjectId): Promise<IFormA1> {
    return await this.formA1Model
      .findOne({ accreditionId: accreditionId })
      .select({ supervisorDetails: 1, _id: 0 });
  }

  async getFormA1FinalCheckListData(accreditionId: ObjectId): Promise<IFormA1> {
    return await this.formA1Model
      .findOne({ accreditionId: accreditionId })
      .select({ addressRecommendation: 1, finalCheckList: 1, _id: 0 });
  }

  async addFormA1(formA1: FormA1DTO): Promise<string> {
    const newFormA1 = new this.formA1Model(formA1);
    await newFormA1.save();
    return newFormA1.id;
  }

  async getFormA1ById(id: ObjectId): Promise<IFormA1> {
    return await this.formA1Model.findById(id);
  }

  async getFormA1ByAccreditionId(accreditionId: ObjectId): Promise<IFormA1> {
    return await this.formA1Model.findOne({ accreditionId: accreditionId });
  }

  async deleteSupervisor(accreditionId: ObjectId, userId: number) {
    await this.formA1Model.findOneAndUpdate(
      { accreditionId: accreditionId },
      { $pull: { supervisorDetails: { userId: userId } } },
    );
  }

  async updateFormA1(id: ObjectId, formA1: IFormA1) {
    await this.formA1Model.updateOne({ _id: id }, formA1);
  }

  async addFormA1ByAccreditionId(
    accreditionId: ObjectId,
    formA1: FormA1DTO,
  ): Promise<void> {
    const dbFormA1 = new this.formA1Model(formA1);
    await this.formA1Model.findOneAndUpdate(
      { accreditionId: accreditionId },
      dbFormA1,
      { upsert: true },
    );
  }
  async deleteFileUpload(fileId: ObjectId) {
    return await this.formA1Model.findOne({
      'supervisorDetails.standardsDetail.filePath._id': fileId,
    });
  }

  async updateDetails(fileId: ObjectId) {
    await this.formA1Model.updateMany(
      { 'supervisorDetails.standardsDetail.filePath._id': fileId },
      {
        $pull: {
          'supervisorDetails.$[].standardsDetail.$[].filePath': {
            _id: fileId,
          },
        },
      },
    );
  }
}
