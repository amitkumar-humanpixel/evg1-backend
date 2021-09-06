import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { FormADTO } from './formA.dto';
import { IFormA } from './formA.interface';

@Injectable()
export class FormADAL {
  constructor(
    @InjectModel('formA')
    private readonly formAModel: Model<IFormA>,
  ) {}

  async addFormA(formA: FormADTO): Promise<string> {
    const newFormA = new this.formAModel(formA);
    await newFormA.save();
    return newFormA.id;
  }

  async getFormAById(id: ObjectId): Promise<IFormA> {
    return await this.formAModel.findById(id);
  }

  async getFormAByAccreditionId(accreditionId: ObjectId): Promise<IFormA> {
    return await this.formAModel.findOne({ accreditionId: accreditionId });
  }

  async getFormASupervisorsByAccreditionId(id: ObjectId): Promise<any> {
    const query: any = [
      {
        $match: {
          accreditionId: id,
        },
      },
    ];
    query.push({
      $unwind: {
        path: '$supervisorDetails',
      },
    });

    query.push({
      $lookup: {
        from: 'users',
        localField: 'supervisorDetails.userId',
        foreignField: 'userId',
        as: 'user',
      },
    });
    query.push({
      $unwind: {
        path: '$user',
      },
    });

    const output = await this.formAModel.aggregate(query);
    return output;
  }

  async getFormAPracticeManagerDataByAccreditionId(id: ObjectId): Promise<any> {
    const query: any = [
      {
        $match: {
          accreditionId: id,
        },
      },
    ];

    query.push({
      $lookup: {
        from: 'users',
        localField: 'practiceManagerDetail.userId',
        foreignField: 'userId',
        as: 'user',
      },
    });
    query.push({
      $unwind: {
        path: '$user',
      },
    });

    const output = await this.formAModel.aggregate(query);
    return output;
  }
  async getUserFullData(accreditionId: ObjectId): Promise<any> {
    const query: any = [
      {
        $match: {
          accreditionId: accreditionId,
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'practiceManagerDetail.userId',
          foreignField: 'userId',
          as: 'user',
        },
      },
      {
        $unwind: {
          path: '$user',
        },
      },
      {
        $lookup: {
          from: 'facility-staffs',
          localField: 'user.userId',
          foreignField: 'userId',
          as: 'facility',
        },
      },
      {
        $lookup: {
          from: 'facilities',
          localField: 'facility.facilityId',
          foreignField: 'facilityId',
          as: 'facilityDetails',
        },
      },
      {
        $project: {
          _id: 0,
          registrarDetails: 0,
          supervisorDetails: 0,
          practiceStandards: 0,
          practiceManagerDetail: 0,
          facility: 0,
        },
      },
      {
        $unwind: {
          path: '$facilityDetails',
        },
      },
    ];
    return await this.formAModel.aggregate(query);
  }
  async getFormARegistrarDataByAccreditionId(id: ObjectId): Promise<any> {
    const query: any = [
      {
        $match: {
          accreditionId: id,
        },
      },
    ];
    query.push({
      $project: {
        registrarDetails: 1,
      },
    });

    query.push({
      $lookup: {
        from: 'facility-registrars',
        localField: 'registrarDetails.placementId',
        foreignField: 'placementId',
        as: 'placement',
      },
    });
    query.push({
      $unwind: {
        path: '$placement',
      },
    });

    const output = await this.formAModel.aggregate(query);
    return output;
  }

  async updateFormA(id: ObjectId, formA: IFormA) {
    await this.formAModel.updateOne({ _id: id }, formA);
  }

  async deleteFileUpload(id: ObjectId, path: string) {
    const pathData = path.split('/');
    const fileData = await this.formAModel.findOne({ accreditionId: id });
    if (fileData) {
      for (let i = 0; i < fileData.practiceStandards.length; i++) {
        if (
          fileData.practiceStandards[i]?.filePath?.includes(
            process.env.BASE_URL + pathData[1],
          ) ??
          false
        ) {
          fileData.practiceStandards[i].filePath = '';
          break;
        }
      }
      await this.formAModel.updateOne({ accreditionId: id }, fileData, {
        new: true,
      });
    }
  }
}
