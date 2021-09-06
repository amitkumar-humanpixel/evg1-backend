import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import {
  FacilityStaffDTO,
  GetFacilityStaffDetailsDTO,
  GetFacilityStaffResponseDTO,
  IGetFacilityStaffDTO,
  PracticeRoles,
} from './facilityStaff.dto';
import { IFacilityStaff } from './facilityStaff.interface';
import { FacilityStaffDAL } from './facilityStaff.dal';
import { ObjectId } from 'mongoose';
import { ResponseHeaders } from 'src/Common/common.dto';
import { CSVParser } from 'src/Helper/csv.helper';
import { validateData } from '../Helper/validation.helper';
import { AccreditionService } from 'src/Accredition/accredition.service';
import { FacilityService } from 'src/Facility/facility.service';

@Injectable()
export class FacilityStaffService {
  constructor(
    private facilityStaffDAL: FacilityStaffDAL,
    private csvParser: CSVParser,
    @Inject(forwardRef(() => AccreditionService))
    private accreditionService: AccreditionService,
    @Inject(forwardRef(() => FacilityService))
    private facilityService: FacilityService,
  ) {}

  async insertFacilityStaff(
    facilityStaff: FacilityStaffDTO,
  ): Promise<IFacilityStaff> {
    return await this.facilityStaffDAL.addFacilityStaff(facilityStaff);
  }

  async getAllFacilityStaff(
    page: number,
    limit: number,
  ): Promise<GetFacilityStaffResponseDTO> {
    const facilitysStaff = await this.facilityStaffDAL.getAllFacilityStaff(
      page,
      limit,
    );
    const response = new GetFacilityStaffResponseDTO();
    const total = facilitysStaff[0].totalCount[0]['count']
      ? facilitysStaff[0].totalCount[0]['count']
      : 0;

    const headers = new Array<ResponseHeaders>();

    const obj =
      facilitysStaff[0].paginatedResult.length > 0
        ? facilitysStaff[0].paginatedResult[0]
        : null;

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
    response.data = facilitysStaff[0].paginatedResult;
    response.headers = headers;
    response.page = page;
    response.limit = limit;
    response.pages = Math.ceil(total / limit);
    response.total = total;
    return response;
  }

  async getFacilityStaffById(id: ObjectId): Promise<IFacilityStaff> {
    const facilityStaff = await this.facilityStaffDAL.getFacilityStaffById(id);
    if (!facilityStaff)
      throw new BadRequestException('Facility Staff does not exist!');
    return facilityStaff;
  }

  async getAccreditorByFacilityId(
    facilityId: number,
  ): Promise<IFacilityStaff[]> {
    const facilityStaff =
      await this.facilityStaffDAL.getFacilityAccreditorStaffByFacilityId(
        facilityId,
      );
    if (!facilityStaff)
      throw new BadRequestException('Facility Staff does not exist!');
    return facilityStaff;
  }

  async getFacilityStaffByFacilityId(facilityId: number): Promise<any> {
    const facilityStaff =
      await this.facilityStaffDAL.getFacilityPracticeManagerByFacilityId(
        facilityId,
      );
    return facilityStaff;
  }

  async getFacilityStaffByfacilityId(
    facilityId: number,
  ): Promise<GetFacilityStaffDetailsDTO> {
    const facilitysStaff =
      await this.facilityStaffDAL.getAllFacilityStaffByFacilityId(facilityId);
    const response = new GetFacilityStaffDetailsDTO();

    const headers = new Array<ResponseHeaders>();

    const obj =
      facilitysStaff.length > 0 ? JSON.stringify(facilitysStaff[0]) : null;
    if (obj !== null) {
      const headerKeys = Object.keys(JSON.parse(obj));
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
    response.staffDetails = facilitysStaff;
    response.headers = headers;
    return response;
  }

  async updateFacilityStaff(
    id: ObjectId,
    facilityStaff: FacilityStaffDTO,
  ): Promise<IFacilityStaff> {
    return await this.facilityStaffDAL.updateFacilityStaff(id, facilityStaff);
  }

  async deleteFacilityStaff(id: ObjectId) {
    await this.facilityStaffDAL.deleteFacilityStaff(id);
  }

  facilityStaffKeys = [
    'FacilityContactId',
    'FacilityId',
    'UserId',
    'First_Name',
    'Last_Name',
    'PracticeRole',
  ];

  async readAndStoreFacilityStaff(buffer: Buffer) {
    let output = await this.csvParser.extractDataFromCSV(
      buffer,
      this.facilityStaffKeys,
    );
    const validationObject = {
      ErrorData: [],
      processed: 0,
      ErrorDataCount: 0,
    };
    output = JSON.parse(JSON.stringify(output));
    const facilitySet = new Set<number>();
    for (let index = 0; index < output.length; index++) {
      const element = output[index];
      if (
        element.FacilityId.trim() === '' &&
        element.FacilityContactId.trim() === ''
      ) {
        continue;
      }
      const newFacilityStaff = new FacilityStaffDTO();
      Object.keys(element).forEach((obj) => {
        if (obj.trim() === 'FacilityId') {
          newFacilityStaff.facilityId = parseInt(element[obj]);
        } else if (obj.trim() === 'FacilityContactId') {
          newFacilityStaff.facilityContactId = parseInt(element[obj].trim());
        } else if (obj.trim() === 'First_Name') {
          newFacilityStaff.firstName = element[obj].trim();
        } else if (obj.trim() === 'Last_Name') {
          newFacilityStaff.lastName = element[obj].trim();
        } else if (obj.trim() === 'UserId') {
          newFacilityStaff.userId = parseInt(element[obj].trim());
        } else if (obj.trim() === 'PracticeRole') {
          newFacilityStaff.practiceRole = PracticeRoles[element[obj].trim()];
        }
      });
      const responseData = validateData(newFacilityStaff);
      if (responseData.isValid === true) {
        await this.facilityStaffDAL.findAndUpdateByFacilityStaffId(
          newFacilityStaff.facilityContactId,
          newFacilityStaff,
        );
        if (
          newFacilityStaff.practiceRole === 'Practice Manager' ||
          newFacilityStaff.practiceRole === 'Principal Supervisor'
        ) {
          facilitySet.add(newFacilityStaff.facilityId as number);
          await this.accreditionService.addPracticeManager(
            newFacilityStaff.facilityId as number,
            newFacilityStaff.userId as number,
          );
        }
        validationObject.processed++;
      } else {
        validationObject.ErrorData.push(
          `Facility Id : ${newFacilityStaff.facilityId} its ${
            responseData?.key ?? ''
          } data is not proper, its data is ${
            responseData?.value ?? ''
          }, due to that it is not processed.`,
        );
        validationObject.ErrorDataCount++;
      }
    }

    if (facilitySet.size > 0) {
      await this.facilityService.convertFacilityToAccreditionFromFacilityIds(
        facilitySet,
      );
    }

    return validationObject;
  }
}
