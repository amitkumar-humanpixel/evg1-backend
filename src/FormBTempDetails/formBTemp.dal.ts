import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { FormBDTO } from '../FormB/formB.dto';
import { IFormBTemp } from './formBTemp.interface';

@Injectable()
export class FormBTempDAL {
  constructor(
    @InjectModel('formBTemp')
    private readonly formBTempModel: Model<IFormBTemp>,
  ) {}

  async getFormBByAccreditionIdId(
    accreditionId: ObjectId,
  ): Promise<IFormBTemp> {
    return await this.formBTempModel.findOne({ accreditionId: accreditionId });
  }

  async addFormB(formB: FormBDTO): Promise<string> {
    const newFormB = new this.formBTempModel(formB);
    await newFormB.save();
    return newFormB.id;
  }

  async updateFormB(id: ObjectId, formB: IFormBTemp) {
    await this.formBTempModel.updateOne({ _id: id }, formB);
  }

  async findAndUpdateFormBByAccreditionId(
    accreditionId: ObjectId,
    formB: FormBDTO,
  ): Promise<void> {
    const dbFormB = new this.formBTempModel(formB);
    await this.formBTempModel.findOneAndUpdate(
      { accreditionId: accreditionId },
      dbFormB,
      { upsert: true },
    );
  }

  async getSummary(id: ObjectId): Promise<any> {
    const query: any = [
      {
        $match: {
          accreditionId: id,
          isDeleted: false,
          isSummaryComplete: false,
        },
      },
    ];
    query.push({
      $lookup: {
        from: 'formas',
        localField: 'formAId',
        foreignField: '_id',
        as: 'formA',
      },
    });

    query.push({
      $unwind: {
        path: '$formA',
      },
    });

    query.push({
      $lookup: {
        from: 'users',
        localField: 'applications.supervisorId',
        foreignField: 'userId',
        as: 'supervisor',
      },
    });
    // query.push({
    //   $unwind: {
    //     path: '$applications',
    //   },
    // });

    query.push({
      $lookup: {
        from: 'users',
        localField: 'accreditorId',
        foreignField: 'userId',
        as: 'accreditor',
      },
    });
    // query.push({
    //   $unwind: {
    //     path: '$supervisor',
    //   },
    // });

    // query.push({
    //   $addFields: {
    //     'applications.name': {
    //       $concat: ['$supervisor.firstName', ' ', '$supervisor.lastName'],
    //     },
    //   },
    // });

    // query.push({
    //   $project: {
    //     assessment: 1,
    //     applications: 1,
    //     classification: 1,
    //     dateOfReportComplete: 1,
    //     dateOfVisit: 1,
    //     shadyOaksPractice: 1,
    //   },
    // });

    const output = await this.formBTempModel.aggregate(query);
    return output;

    // return await this.formBTempModel.findOne({ accreditionId: id }).select({
    //   _id: 0,
    //   assessment: 1,
    //   applications: 1,
    //   classification: 1,
    //   dateOfReportComplete: 1,
    //   dateOfVisit: 1,
    //   shadyOaksPractice: 1,
    // });
  }

  async getOtherDetails(id: ObjectId): Promise<IFormBTemp> {
    return await this.formBTempModel
      .findOne({
        accreditionId: id,
        isDeleted: false,
        isDeclarationComplete: false,
      })
      .select({
        _id: 0,
        previousIssues: 1,
        summery: 1,
        recomendationPanel: 1,
        reviewedBy: 1,
        isAgree: 1,
      });
  }

  async deleteFormBTempDetails(id: ObjectId) {
    await this.formBTempModel.deleteOne({ accreditionId: id });
  }
}
