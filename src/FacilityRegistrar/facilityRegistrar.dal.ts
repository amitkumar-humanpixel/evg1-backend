import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  FacilityRegistrarDTO,
  IGetFacilityRegistrarDTO,
} from './facilityRegistrar.dto';
import { IFacilityRegistrar } from './facilityRegistrar.interface';
import { Model, ObjectId } from 'mongoose';

@Injectable()
export class FacilityRegistrarDAL {
  constructor(
    @InjectModel('facility-registrar')
    private readonly facilityRegistrarModel: Model<IFacilityRegistrar>,
  ) {}

  async addFacilityRegistrar(
    facility: FacilityRegistrarDTO,
  ): Promise<IFacilityRegistrar> {
    const newFacilityRegistrar = new this.facilityRegistrarModel(facility);
    await newFacilityRegistrar.save();
    return newFacilityRegistrar;
  }

  async getAllFacilityRegistrar(
    skip: number,
    limit: number,
  ): Promise<IGetFacilityRegistrarDTO> {
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

    return (await this.facilityRegistrarModel
      .aggregate(query)
      .allowDiskUse(true)) as unknown as IGetFacilityRegistrarDTO;
  }

  async getFacilityRegistrarById(id: ObjectId): Promise<IFacilityRegistrar> {
    return this.facilityRegistrarModel.findOne({ _id: id, isDeleted: false });
  }

  async getFacilityRegistrarByFacilityId(
    facilityId: number,
  ): Promise<IFacilityRegistrar[]> {
    return this.facilityRegistrarModel.find({ facilityId: facilityId });
  }

  async updateFacilityRegistrar(
    id: ObjectId,
    facilityRegistrar: FacilityRegistrarDTO,
  ): Promise<IFacilityRegistrar> {
    const updateFacilityRegistrar = await this.facilityRegistrarModel.findOne({
      _id: id,
      isDeleted: false,
    });

    if (!updateFacilityRegistrar)
      throw new BadRequestException('Facility does not exist!');

    if (facilityRegistrar.facilityId) {
      updateFacilityRegistrar.facilityId = facilityRegistrar.facilityId;
    }
    if (facilityRegistrar.placementId) {
      updateFacilityRegistrar.placementId = facilityRegistrar.placementId;
    }
    if (facilityRegistrar.firstName) {
      updateFacilityRegistrar.firstName = facilityRegistrar.firstName;
    }
    if (facilityRegistrar.lastName) {
      updateFacilityRegistrar.lastName = facilityRegistrar.lastName;
    }
    if (facilityRegistrar.startDate) {
      updateFacilityRegistrar.startDate = facilityRegistrar.startDate;
    }
    if (facilityRegistrar.endDate) {
      updateFacilityRegistrar.endDate = facilityRegistrar.endDate;
    }
    return await updateFacilityRegistrar.save();
  }

  async deleteFacilityRegistrar(id: ObjectId): Promise<void> {
    await this.facilityRegistrarModel.findOneAndUpdate(
      { _id: id },
      { $set: { isDeleted: true } },
    );
  }

  async findAndUpdateByFacilityRegistrarId(
    placementId: number,
    facilityRegistrar: FacilityRegistrarDTO,
  ): Promise<void> {
    await this.facilityRegistrarModel.findOneAndUpdate(
      { placementId: placementId },
      facilityRegistrar,
      { upsert: true },
    );
  }
}
