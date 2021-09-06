import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FacilityDTO, IGetFacilityDTO } from './facility.dto';
import { IFacility } from './facility.interface';
import { FilterQuery, Model, ObjectId } from 'mongoose';

@Injectable()
export class FacilityDAL {
  constructor(
    @InjectModel('facility') private readonly facilityModel: Model<IFacility>,
  ) {}

  async addFacility(facility: FacilityDTO): Promise<IFacility> {
    const newFacility = new this.facilityModel(facility);
    if (
      // newFacility.postalCode.toString() === 'NULL' ||
      !newFacility.postalCode
    ) {
      newFacility.postalCode = '';
    } else if (
      // newFacility.address.toString() === 'NULL' ||
      !newFacility.address
    ) {
      newFacility.address = '';
    } else if (
      // newFacility.suburb.toString() === 'NULL' ||
      !newFacility.suburb
    ) {
      newFacility.suburb = '';
    }
    await newFacility.save();
    return newFacility;
  }

  async getAllFacility(skip: number, limit: number): Promise<IGetFacilityDTO> {
    const query: any = [{ $match: { isDeleted: false } }];
    // query.push({
    //   $lookup: {
    //     from: 'facility-staffs',
    //     localField: 'facilityId',
    //     foreignField: 'facilityId',
    //     as: 'staffs',
    //   },
    // });

    query.push({
      $project: { isDeleted: 0, __v: 0, createdAt: 0, updatedAt: 0, userId: 0 },
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

    return (await this.facilityModel
      .aggregate(query)
      .allowDiskUse(true)) as unknown as IGetFacilityDTO;
  }

  async getFacilityById(id: ObjectId): Promise<IFacility> {
    return this.facilityModel.findOne({ _id: id, isDeleted: false });
  }

  async getFacilityByFacilityId(facilityId: number): Promise<IFacility> {
    return this.facilityModel.findOne({ facilityId: facilityId });
  }

  async getByFacilityFilterSkipLimit(
    filter: FilterQuery<any>,
    skip: number,
    limit: number,
  ): Promise<IFacility[]> {
    return this.facilityModel.find(filter).skip(skip).limit(limit);
  }

  async updateFacility(
    id: ObjectId,
    facility: FacilityDTO,
  ): Promise<IFacility> {
    const updateFacility = await this.facilityModel.findOne({
      _id: id,
      isDeleted: false,
    });

    if (!updateFacility)
      throw new BadRequestException('Facility does not exist!');

    if (facility.address) {
      updateFacility.address = facility.address;
    }
    if (facility.practiceName) {
      updateFacility.practiceName = facility.practiceName;
    }
    if (facility.address) {
      updateFacility.address = facility.address;
    }
    if (facility.suburb) {
      updateFacility.suburb = facility.suburb;
    }
    if (facility.postalCode) {
      updateFacility.postalCode = facility.postalCode;
    }
    if (facility.email) {
      updateFacility.email = facility.email;
    }
    if (facility.startDate) {
      updateFacility.startDate = facility.startDate;
    }
    if (facility.dueDate) {
      updateFacility.dueDate = facility.dueDate;
    }
    return await updateFacility.save();
  }

  async updateFacilityByFacilityDetails(facility: IFacility) {
    await this.facilityModel.updateOne(
      { _id: facility._id },
      { isMailSent: true },
    );
  }

  async deleteFacility(id: ObjectId): Promise<void> {
    await this.facilityModel.findOneAndUpdate(
      { _id: id },
      { $set: { isDeleted: true } },
    );
  }

  async getFacilitysForAccredition(date: Date): Promise<IFacility[]> {
    return await this.facilityModel.find({
      isMailSent: false,
      startDate: { $lte: date },
    });
  }

  async getFacilitysForFacilityIds(
    facilityIds: Array<number>,
  ): Promise<IFacility[]> {
    return await this.facilityModel.find({
      facilityId: { $in: facilityIds },
    });
  }

  async updateFacilityStatus(date: Date): Promise<void> {
    await this.facilityModel.updateMany(
      {
        isMailSent: false,
        startDate: { $lte: date },
      },
      { isMailSent: true },
    );
  }
  async findAndUpdateByFacilityId(
    facilityId: number,
    facility: FacilityDTO,
  ): Promise<void> {
    await this.facilityModel.findOneAndUpdate(
      { facilityId: facilityId },
      facility,
      { upsert: true },
    );
  }
}
