import { BadRequestException, forwardRef, Inject, Injectable } from '@nestjs/common';
import {
  GetUserResponseDTO,
  IGetUserDTO,
  UserDTO,
  UserRoles,
} from './user.dto';
import { IUser } from './user.interface';
import { UserDAL } from './user.dal';
import { ObjectId } from 'mongoose';
import { ResponseHeaders } from 'src/Common/common.dto';
import { CSVParser } from 'src/Helper/csv.helper';
import { validateData } from '../Helper/validation.helper';
import { AccreditionService } from 'src/Accredition/accredition.service';

@Injectable()
export class UserService {
  constructor(
    private readonly userDAL: UserDAL,
    private readonly csvParser: CSVParser,
  ) { }

  async insertUser(user: UserDTO): Promise<IUser> {
    return await this.userDAL.addUser(user);
  }

  async getAllUsers(page: number, limit: number): Promise<GetUserResponseDTO> {
    const users = await this.userDAL.getAllUser(page, limit);
    const response = new GetUserResponseDTO();
    const total = users[0].totalCount[0]['count']
      ? users[0].totalCount[0]['count']
      : 0;

    const headers = new Array<ResponseHeaders>();

    const obj =
      users[0].paginatedResult.length > 0 ? users[0].paginatedResult[0] : null;

    if (obj !== null) {
      const headerKeys = Object.keys(obj);

      headerKeys.map((key) => {
        if (key != '_id') {
          const header = new ResponseHeaders();
          header.name = key;
          header.label = key
            .replace(/(_|-)/g, ' ')
            .trim()
            .replace(/\w\S*/g, function (str) {
              return str.charAt(0).toUpperCase() + str.substr(1);
            })
            .replace(/([a-z])([A-Z])/g, '$1 $2')
            .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2');
          header.type = 'string';
          headers.push(header);
        }
      });
    }
    response.data = users[0].paginatedResult;
    response.headers = headers;
    response.page = page;
    response.limit = limit;
    response.pages = Math.ceil(total / limit);
    response.total = total;

    return response;
  }

  async getUserById(id: ObjectId): Promise<IUser> {
    const user = await this.userDAL.getUserById(id);
    if (!user) throw new BadRequestException('User does not exist!');
    return user;
  }

  async getUserByEmail(email: string): Promise<IUser> {
    const user = await this.userDAL.getUserByEmailId(email.toLowerCase());
    if (!user) throw new BadRequestException('User does not exist!');
    return user;
  }

  async getUserByUserId(userId: number): Promise<IUser> {
    return await this.userDAL.getUserByUserId(userId);
  }

  async updateUser(id: ObjectId, user: UserDTO): Promise<IUser> {
    return await this.userDAL.updateUser(id, user);
  }

  async deleteUser(id: ObjectId) {
    await this.userDAL.deleteUser(id);
  }

  userKeys = ['UsersId', 'Email', 'FirstName', 'LastName', 'Role'];

  async readAndStoreUser(buffer: Buffer) {
    let output = await this.csvParser.extractDataFromCSV(buffer, this.userKeys);
    const validationObject = {
      ErrorData: [],
      processed: 0,
      ErrorDataCount: 0,
    };
    const users = [];
    output = JSON.parse(JSON.stringify(output));
    for (let index = 0; index < output.length; index++) {
      const element = output[index];
      if (
        element?.Email?.trim() === '' &&
        element?.FirstName?.trim() === '' &&
        element?.LastName?.trim() === '' &&
        element?.Role?.trim() === ''
      ) {
        console.log('in');
        continue;
      }
      const newUser = new UserDTO();
      Object.keys(element).forEach((obj) => {
        if (obj.trim() === 'UsersId') {
          newUser.usersId = parseInt(element[obj]);
        } else if (obj.trim() === 'Email') {
          newUser.email = element[obj]?.trim()?.toLowerCase() ?? undefined;
        } else if (obj.trim() === 'FirstName') {
          newUser.firstName = element[obj].trim();
        } else if (obj.trim() === 'LastName') {
          newUser.lastName = element[obj].trim();
        } else if (obj.trim() === 'Role') {
          newUser.role = UserRoles[element[obj].trim()];
        }
      });

      //const errors = await validate(newFacility);

      // if (errors && errors.length > 0) {
      //   console.log(errors.length);
      //   const errorArray = [];
      //   for (const error of errors) {
      //     const e = error.constraints;
      //     errorArray.push(e);
      //   }
      //   console.log(errorArray);
      //   throw new BadRequestException(
      //     'Getting error while uploading file due to improper data!',
      //   );
      //   break;
      // }
      const responseData = validateData(newUser);
      if (responseData.isValid === true) {
        await this.userDAL.findAndUpdateByUserId(newUser.usersId, newUser);
        // if (
        //   newUser.role == UserRoles.Accreditation_Support_Coordinator ||
        //   newUser.role == UserRoles.Super_Admin
        // ) {
        //   users.push(newUser.usersId);
        // }
        validationObject.processed++;
      } else {
        validationObject.ErrorData.push(
          `User Id : ${newUser.usersId.toString() === 'NaN' ? '' : newUser.usersId
          } its ${responseData?.key ?? ''} data is not proper, its data is ${responseData?.value ?? ''
          }, due to that it is not processed.`,
        );
        validationObject.ErrorDataCount++;
      }
    }

    return validationObject;
  }
  async getUserAndFacilityDetails(userId: number) {
    return await this.userDAL.getUserAndFacilityDetails(userId);
  }

  async getSuperAdmins() {
    return await this.userDAL.getSuperAdmins();
  }

  async getASCUsers() {
    return await this.userDAL.getASCUsers();
  }

  async getAccreditors() {
    return await this.userDAL.getAccreditor();
  }

  async getAccreditorById(userId: number) {
    return await this.userDAL.getUserByUserId(userId);
  }
  async getASCData() {
    return await this.userDAL.getASCData();
  }
}
