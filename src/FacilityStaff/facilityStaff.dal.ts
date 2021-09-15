import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  FacilityStaffDTO,
  IGetFacilityStaffDTO,
  PracticeRoles,
} from './facilityStaff.dto';
import { IFacilityStaff } from './facilityStaff.interface';
import { Model, ObjectId } from 'mongoose';

@Injectable()
export class FacilityStaffDAL {
  constructor(
    @InjectModel('facility-staff')
    private readonly facilityStaffModel: Model<IFacilityStaff>,
  ) { }

  async addFacilityStaff(
    facilityStaff: FacilityStaffDTO,
  ): Promise<IFacilityStaff> {
    const newFacilityStaff = new this.facilityStaffModel(facilityStaff);
    await newFacilityStaff.save();
    return newFacilityStaff;
  }

  async getAllFacilityStaff(
    skip: number,
    limit: number,
  ): Promise<IGetFacilityStaffDTO> {
    const query: any = [{ $match: { isDeleted: false } }];
    query.push({
      $project: { isDeleted: 0, __v: 0, createdAt: 0, updatedAt: 0 },
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

    return (await this.facilityStaffModel
      .aggregate(query)
      .allowDiskUse(true)) as unknown as IGetFacilityStaffDTO;
  }

  async getAllFacilityStaffByFacilityId(
    facilityId: number,
  ): Promise<IFacilityStaff[]> {
    return this.facilityStaffModel.find(
      {
        facilityId: facilityId,
        isDeleted: false,
      },
      'userId firstName lastName practiceRole facilityId',
    );
  }

  async getFacilityStaffById(id: ObjectId): Promise<IFacilityStaff> {
    return this.facilityStaffModel.findOne({ _id: id, isDeleted: false });
  }

  async getFacilityAccreditorStaffByFacilityId(
    facilityId: number,
  ): Promise<IFacilityStaff[]> {
    return this.facilityStaffModel.find({
      facilityId: facilityId,
      practiceRole: /Accreditor/i,
    });
  }

  async getFacilityPracticeManagerByFacilityId(id: number): Promise<any> {
    const query: any = [
      {
        $match: {
          facilityId: id,
          isDeleted: false,
          $or: [
            { practiceRole: 'Practice Manager' },
            { practiceRole: 'Principal Educational Supervisor' },
          ],
        },
      },
    ];
    query.push({
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: 'userId',
        as: 'user',
      },
    });
    query.push({
      $unwind: {
        path: '$user',
      },
    });

    const output = await this.facilityStaffModel.aggregate(query);
    return output;
  }

  async getFacilitySupervisorByFacilityId(id: number): Promise<any> {
    const query: any = [
      {
        $match: {
          facilityId: parseInt(id.toString()),
          isDeleted: false,
          $or: [
            { practiceRole: 'Clinical Supervisor' },
            { practiceRole: 'Educational Supervisor' },
            { practiceRole: 'Principal Educational Supervisor' },
          ],
        },
      },
    ];
    query.push({
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: 'userId',
        as: 'user',
      },
    });
    query.push({
      $unwind: {
        path: '$user',
      },
    });

    const output = await this.facilityStaffModel.aggregate(query);
    return output;
  }

  async getFacilityAccreditorByFacilityId(id: number): Promise<any> {
    const query: any = [
      {
        $match: {
          facilityId: id,
          isDeleted: false,
          practiceRole: /accreditor/i,
        },
      },
    ];
    query.push({
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: 'userId',
        as: 'user',
      },
    });
    query.push({
      $unwind: {
        path: '$user',
      },
    });

    const output = await this.facilityStaffModel.aggregate(query);
    return output;
  }

  async updateFacilityStaff(
    id: ObjectId,
    facilityStaff: FacilityStaffDTO,
  ): Promise<IFacilityStaff> {
    const updateFacilityStaff = await this.facilityStaffModel.findOne({
      _id: id,
      isDeleted: false,
    });

    if (!updateFacilityStaff)
      throw new BadRequestException('Facility does not exist!');

    if (facilityStaff.facilityId) {
      updateFacilityStaff.facilityId = facilityStaff.facilityId;
    }
    if (facilityStaff.facilityContactId) {
      updateFacilityStaff.facilityContactId = facilityStaff.facilityContactId;
    }
    if (facilityStaff.firstName) {
      updateFacilityStaff.firstName = facilityStaff.firstName;
    }
    if (facilityStaff.lastName) {
      updateFacilityStaff.lastName = facilityStaff.lastName;
    }
    if (facilityStaff.userId) {
      updateFacilityStaff.userId = facilityStaff.userId;
    }
    if (facilityStaff.practiceRole) {
      updateFacilityStaff.practiceRole = facilityStaff.practiceRole;
    }
    return await updateFacilityStaff.save();
  }

  async deleteFacilityStaff(id: ObjectId): Promise<void> {
    await this.facilityStaffModel.findOneAndUpdate(
      { _id: id },
      { $set: { isDeleted: true } },
    );
  }

  async findAndUpdateByFacilityStaffId(
    facilityContactId: number,
    facilityRegistrar: FacilityStaffDTO,
  ): Promise<void> {
    await this.facilityStaffModel.findOneAndUpdate(
      { facilityContactId: facilityContactId },
      facilityRegistrar,
      { upsert: true },
    );
  }
}
