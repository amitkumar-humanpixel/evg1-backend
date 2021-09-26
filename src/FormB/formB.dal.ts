import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { FormBDTO } from './formB.dto';
import { IFormB } from './formB.interface';

@Injectable()
export class FormBDAL {
  constructor(
    @InjectModel('formB')
    private readonly formBModel: Model<IFormB>,
  ) { }

  async addFormB(formB: FormBDTO): Promise<string> {
    const newFormB = new this.formBModel(formB);
    await newFormB.save();
    return newFormB.id;
  }

  async getFormBById(id: ObjectId): Promise<IFormB> {
    return await this.formBModel.findById(id);
  }

  async getFormBByAccreditionIdId(accreditionId: ObjectId): Promise<IFormB> {
    return await this.formBModel.findOne({ accreditionId: accreditionId });
  }

  async updateFormB(id: ObjectId, formB: IFormB) {
    await this.formBModel.updateOne({ _id: id }, formB);
  }

  async getFormBByAccreditionIdAndFormAId(
    accreditionId: ObjectId,
    formAId: ObjectId,
  ): Promise<IFormB> {
    return await this.formBModel.findOne({
      accreditionId: accreditionId,
      formAId: formAId,
    });
  }

  async getFormBByAccreditionId(accreditionId: ObjectId): Promise<IFormB> {
    return await this.formBModel.findOne({
      accreditionId: accreditionId,
    });
  }

  async findAndUpdateFormBByAccreditionId(
    accreditionId: ObjectId,
    formB: FormBDTO,
  ): Promise<void> {
    const dbFormB = new this.formBModel(formB);
    await this.formBModel.findOneAndUpdate(
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

    const output = await this.formBModel.aggregate(query);
    return output;

    // return await this.formBModel.findOne({ accreditionId: id }).select({
    //   _id: 0,
    //   assessment: 1,
    //   applications: 1,
    //   classification: 1,
    //   dateOfReportComplete: 1,
    //   dateOfVisit: 1,
    //   shadyOaksPractice: 1,
    // });
  }

  async getOtherDetails(id: ObjectId): Promise<IFormB> {
    return await this.formBModel.findOne({ accreditionId: id }).select({
      _id: 0,
      previousIssues: 1,
      summery: 1,
      recomendationPanel: 1,
      reviewedBy: 1,
      isAgree: 1,
    });
  }
}
