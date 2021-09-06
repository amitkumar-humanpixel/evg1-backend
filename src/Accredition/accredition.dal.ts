import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import {
  CreateAccreditionDTO,
  PostDetailAddDTO,
  PostDetailsDTO,
} from './accredition.dto';
import { IAccredition } from './accredition.interface';

@Injectable()
export class AccreditionDAL {
  constructor(
    @InjectModel('accredition')
    private readonly accreditionModel: Model<IAccredition>,
  ) {}

  async createAccredition(
    accredition: CreateAccreditionDTO,
  ): Promise<IAccredition> {
    const newAccredition = new this.accreditionModel(accredition);
    await newAccredition.save();
    return newAccredition;
  }

  async updateAccredition(accredition: PostDetailAddDTO): Promise<ObjectId> {
    const objAccredition = await this.accreditionModel.findOneAndUpdate(
      { facilityId: accredition.facilityId },
      accredition,
      { upsert: true },
    );
    return objAccredition._id;
  }

  async updateAccreditionById(
    id: ObjectId,
    accredition: IAccredition,
  ): Promise<void> {
    await this.accreditionModel.findOneAndUpdate({ _id: id }, accredition, {
      upsert: true,
    });
  }

  async getAccreditionByFacilityId(facilityId: number): Promise<IAccredition> {
    return await this.accreditionModel
      .findOne({ facilityId: facilityId })
      .lean()
      .exec();
  }

  async getAccreditionByUserId(userId: number): Promise<IAccredition> {
    return await this.accreditionModel
      .findOne({ users: { $in: [userId.toString()] } })
      .lean()
      .exec();
  }

  async getAllAccreditions(): Promise<IAccredition[]> {
    return await this.accreditionModel.find({}).lean().exec();
  }

  async getAccreditionById(accreditionId: ObjectId): Promise<IAccredition> {
    return await this.accreditionModel
      .findOne({ _id: accreditionId })
      .lean()
      .exec();
  }

  async getAccreditionDetailsById(accreditionId: ObjectId) {
    const query: any = [];

    query.push({ $match: { _id: accreditionId } });

    query.push({
      $lookup: {
        from: 'facilities',
        localField: 'facilityId',
        foreignField: 'facilityId',
        as: 'facility',
      },
    });
    query.push({
      $unwind: {
        path: '$facility',
      },
    });

    const output = await this.accreditionModel
      .aggregate(query)
      .allowDiskUse(true);
    return output[0];
  }

  async getDashboardData(
    userId: number,
    skip: number,
    limit: number,
    status: string,
  ): Promise<any> {
    const query: any = [];
    if (userId != 0) {
      query.push({
        $match: { users: { $in: [userId.toString()] }, status: status },
      });
    } else {
      query.push({ $match: { status: status } });
    }
    // query.push({
    //   $project: { isDeleted: 0, __v: 0, createdAt: 0, updatedAt: 0 },
    // });
    query.push({
      $lookup: {
        from: 'facilities',
        localField: 'facilityId',
        foreignField: 'facilityId',
        as: 'facility',
      },
    });
    query.push({
      $unwind: {
        path: '$facility',
      },
    });
    query.push({
      $project: {
        status: 1,
        createdAt: 1,
        facility: 1,
        facilityId: 1,
        formA: 1,
        formA1: 1,
        formB: 1,
        _id: 1,
        isPostDetailsComplete: 1,
      },
    });
    query.push({
      $facet: {
        paginatedResult: [
          {
            $skip: (skip - 1) * limit,
          },
          { $limit: limit },
        ],
        totalCount: [
          {
            $count: 'count',
          },
        ],
      },
    });
    return await this.accreditionModel.aggregate(query).allowDiskUse(true);
  }

  async getSupervisorDashboardData(
    userId: number,
    skip: number,
    limit: number,
    status: boolean,
  ): Promise<any> {
    const query: any = [];

    query.push({
      $match: {
        'formA1.userId': userId.toString(),
        'formA1.isComplete': status,
      },
    });

    query.push({
      $lookup: {
        from: 'facilities',
        localField: 'facilityId',
        foreignField: 'facilityId',
        as: 'facility',
      },
    });
    query.push({
      $unwind: {
        path: '$facility',
      },
    });
    query.push({
      $project: {
        status: 1,
        createdAt: 1,
        facility: 1,
        facilityId: 1,
        formA: 1,
        formA1: 1,
        formB: 1,
        _id: 1,
        isPostDetailsComplete: 1,
      },
    });
    query.push({
      $facet: {
        paginatedResult: [
          {
            $skip: (skip - 1) * limit,
          },
          { $limit: limit },
        ],
        totalCount: [
          {
            $count: 'count',
          },
        ],
      },
    });
    return await this.accreditionModel.aggregate(query).allowDiskUse(true);
  }

  async getSupervisorDashboardStatusData(userId: number): Promise<any> {
    const query: any = [];

    query.push({
      $match: {
        'formA1.userId': userId.toString(),
      },
    });

    return await this.accreditionModel.aggregate(query).allowDiskUse(true);
  }

  async getPracticeNameFromAccreditionId(
    accreditionId: ObjectId,
  ): Promise<any> {
    const query: any = [];

    query.push({
      $match: {
        _id: accreditionId,
      },
    });

    query.push({
      $lookup: {
        from: 'facilities',
        localField: 'facilityId',
        foreignField: 'facilityId',
        as: 'facility',
      },
    });

    query.push({
      $unwind: {
        path: '$facility',
      },
    });

    return await this.accreditionModel.aggregate(query).allowDiskUse(true);
  }

  async getPracticeManagerDashboardData(
    userId: number,
    skip: number,
    limit: number,
    status: string,
  ): Promise<any> {
    const query: any = [];

    query.push({
      $match: {
        status: status,
        users: { $in: [userId.toString()] },
      },
    });

    query.push({
      $lookup: {
        from: 'facilities',
        localField: 'facilityId',
        foreignField: 'facilityId',
        as: 'facility',
      },
    });
    query.push({
      $unwind: {
        path: '$facility',
      },
    });
    query.push({
      $project: {
        status: 1,
        createdAt: 1,
        facility: 1,
        facilityId: 1,
        formA: 1,
        formA1: 1,
        formB: 1,
        _id: 1,
        isPostDetailsComplete: 1,
      },
    });
    query.push({
      $facet: {
        paginatedResult: [
          {
            $skip: (skip - 1) * limit,
          },
          { $limit: limit },
        ],
        totalCount: [
          {
            $count: 'count',
          },
        ],
      },
    });
    return await this.accreditionModel.aggregate(query).allowDiskUse(true);
  }

  async getPracticeManagerDashboardStatusData(userId: number): Promise<any> {
    const query: any = [];

    query.push({
      $match: {
        users: { $in: [userId.toString()] },
      },
    });

    query.push({
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    });

    return await this.accreditionModel.aggregate(query).allowDiskUse(true);
  }

  async getDashboardStatusData(userId: number) {
    const query: any = [];

    query.push({
      $match: { users: { $in: [userId.toString()] } },
    });

    query.push({
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    });
    const output = await this.accreditionModel.aggregate(query);
    return output;
  }

  async getAccreditionByIdForPostDetails(
    accreditionId: ObjectId,
  ): Promise<PostDetailsDTO> {
    const query: any = [
      {
        $match: {
          _id: accreditionId,
        },
      },
    ];
    query.push({
      $lookup: {
        from: 'facilities',
        localField: 'facilityId',
        foreignField: 'facilityId',
        as: 'facility',
      },
    });
    query.push({
      $unwind: {
        path: '$facility',
      },
    });

    query.push({
      $addFields: {
        facilityName: '$facility.practiceName',
      },
    });
    query.push({
      $project: {
        facilityId: 1,
        address: 1,
        phone: 1,
        totalNumberGPs: 1,
        practiceWebsite: 1,
        college: 1,
        accreditationBody: 1,
        accreditationEndDate: 1,
        facilityName: 1,
      },
    });

    const output = await this.accreditionModel.aggregate(query);
    return output as unknown as PostDetailsDTO;
  }

  async checkUserWithUserId(userId: number): Promise<any> {
    return await this.accreditionModel.findOne({
      users: { $in: [`${userId}`] },
    });
  }
  async getAccreditationSupportCoordinatorData(
    accreditionId: ObjectId,
  ): Promise<any> {
    const query = [
      {
        $match: {
          _id: accreditionId,
          isDeleted: false,
        },
      },
      {
        $lookup: {
          from: 'facilities',
          localField: 'facilityId',
          foreignField: 'facilityId',
          as: 'facility',
        },
      },
      {
        $lookup: {
          from: 'facility-staffs',
          localField: 'facilityId',
          foreignField: 'facilityId',
          as: 'facilityStaff',
        },
      },
      {
        $unwind: {
          path: '$facilityStaff',
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'facilityStaff.userId',
          foreignField: 'userId',
          as: 'userDetails',
        },
      },
      {
        $project: {
          facilityStaff: 0,
          _id: 0,
          isFormAComplete: 0,
          isFormA1Complete: 0,
          isFormBComplete: 0,
          isPostDetailsComplete: 0,
          address: 0,
          formA: 0,
          formA1: 0,
          formB: 0,
          accreditationBody: 0,
          accreditationEndDate: 0,
          college: 0,
          __v: 0,
          phone: 0,
          totalNumberGPs: 0,
        },
      },
      {
        $unwind: {
          path: '$userDetails',
        },
      },
    ];
    return await this.accreditionModel.aggregate(query);
  }
}
