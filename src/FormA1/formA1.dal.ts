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
  async deleteFileUpload(id: ObjectId, path: string) {
    const fileData = await this.formA1Model.findOne({ accreditionId: id });
    const pathData = path.split('/');
    for (let i = 0; i < fileData.supervisorDetails.length; i++) {
      for (
        let j = 0;
        j < fileData.supervisorDetails[i].standardsDetail.length;
        j++
      ) {
        if (fileData?.supervisorDetails[i]?.standardsDetail[j]?.filePath) {
          if (
            fileData?.supervisorDetails[i]?.standardsDetail[j]?.filePath?.some(
              (x) => x.fileUrl === process.env.BASE_URL + pathData[1],
            )
          ) {
            fileData.supervisorDetails[i].standardsDetail[j].filePath =
              fileData.supervisorDetails[i].standardsDetail[j].filePath?.filter(
                (x) => x.fileUrl !== process.env.BASE_URL + pathData[1],
              );
            break;
          }
        }
      }
    }
    await this.formA1Model.updateOne({ accreditionId: id }, fileData, {
      new: true,
    });
  }
}
