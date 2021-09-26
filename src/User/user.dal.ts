import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { IGetUserDTO, UserDTO } from './user.dto';
import { IUser } from './user.interface';
import { Model, ObjectId } from 'mongoose';

@Injectable()
export class UserDAL {
  constructor(@InjectModel('user') private readonly userModel: Model<IUser>) { }

  async addUser(user: UserDTO): Promise<IUser> {
    const newUser = new this.userModel(user);
    await newUser.save();
    return newUser;
  }

  async getAllUser(skip: number, limit: number): Promise<IGetUserDTO> {
    const query: any = [{ $match: { isDeleted: false } }];
    query.push({
      $project: {
        isDeleted: 0,
        __v: 0,
        createdAt: 0,
        updatedAt: 0,
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
    return (await this.userModel
      .aggregate(query)
      .allowDiskUse(true)) as unknown as IGetUserDTO;
  }

  async getUserById(id: ObjectId): Promise<IUser> {
    return this.userModel.findOne({ _id: id, isDeleted: false });
  }

  async getUserByUserId(userId: number): Promise<IUser> {
    return this.userModel.findOne({ userId: userId });
  }
  async getUserByEmailId(email: string): Promise<IUser> {
    return this.userModel.findOne({ email: email });
  }

  async updateUser(id: ObjectId, user: UserDTO): Promise<IUser> {
    const updateUser = await this.userModel.findOne({
      _id: id,
      isDeleted: false,
    });

    if (!updateUser) throw new BadRequestException('User does not exist!');

    if (user.usersId) {
      updateUser.userId = user.usersId;
    }
    if (user.firstName) {
      updateUser.firstName = user.firstName;
    }
    if (user.lastName) {
      updateUser.lastName = user.lastName;
    }
    if (user.email) {
      updateUser.email = user.email;
    }
    if (user.role) {
      updateUser.role = user.role;
    }

    return await updateUser.save();
  }

  async deleteUser(id: ObjectId): Promise<void> {
    await this.userModel.findOneAndUpdate(
      { _id: id },
      { $set: { isDeleted: true } },
    );
  }

  async findAndUpdateByUserId(userId: number, user: UserDTO): Promise<void> {
    await this.userModel.findOneAndUpdate({ userId: userId }, user, {
      upsert: true,
    });
  }

  async getSuperAdmins(): Promise<IUser[]> {
    return await this.userModel.find({ role: /admin/i });
  }

  async getASCUsers(): Promise<IUser[]> {
    return await this.userModel.find({
      role: /Accreditation_Support_Coordinator/i,
    });
  }

  async getAccreditor(): Promise<any> {
    const query: any = [
      {
        $match: {
          role: /accreditor/i,
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

    const output = await this.userModel.aggregate(query);
    return output;
  }

  async getUserAndFacilityDetails(userId: number): Promise<any> {
    const query: any = [
      {
        $match: {
          userId: userId,
          isDeleted: false,
        },
      },
      {
        $lookup: {
          from: 'facility-staffs',
          localField: 'userId',
          foreignField: 'userId',
          as: 'user',
        },
      },
      {
        $lookup: {
          from: 'facilities',
          localField: 'user.facilityId',
          foreignField: 'facilityId',
          as: 'facility',
        },
      },
      {
        $project: {
          userId: 1,
          _id: 0,
          email: 1,
          firstName: 1,
          lastName: 1,
          role: 1,
          'user.facilityId': 1,
          'facility.practiceName': 1,
        },
      },
    ];
    return await this.userModel.aggregate(query);
  }
  async getASCData(): Promise<any> {
    return await this.userModel.aggregate([
      {
        $match: {
          role: 'Accreditation_Support_Coordinator',
          isDeleted: false,
        },
      },
    ]);
  }
}
