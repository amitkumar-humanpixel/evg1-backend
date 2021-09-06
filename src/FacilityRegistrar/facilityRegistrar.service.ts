import { BadRequestException, Injectable } from '@nestjs/common';
import {
  FacilityRegistrarDTO,
  GetFacilityRegistrarDTOResponse,
  IGetFacilityRegistrarDTO,
  IPaginatedResult,
} from './facilityRegistrar.dto';
import { IFacilityRegistrar } from './facilityRegistrar.interface';
import { FacilityRegistrarDAL } from './facilityRegistrar.dal';
import { ObjectId } from 'mongoose';
import * as moment from 'moment-timezone';
import { ResponseHeaders } from 'src/Common/common.dto';
import { CSVParser } from 'src/Helper/csv.helper';
import { validateData } from '../Helper/validation.helper';

@Injectable()
export class FacilityRegistrarService {
  constructor(
    private facilityRegistrarDAL: FacilityRegistrarDAL,
    private csvParser: CSVParser,
  ) {}

  async insertFacilityRegistrar(
    facilityRegistrar: FacilityRegistrarDTO,
  ): Promise<IFacilityRegistrar> {
    return await this.facilityRegistrarDAL.addFacilityRegistrar(
      facilityRegistrar,
    );
  }

  async getAllFacilityRegistrar(
    page: number,
    limit: number,
  ): Promise<GetFacilityRegistrarDTOResponse> {
    const facilitysRegistrar =
      await this.facilityRegistrarDAL.getAllFacilityRegistrar(page, limit);
    const response = new GetFacilityRegistrarDTOResponse();
    if (facilitysRegistrar[0].totalCount.length > 0) {
      const total = facilitysRegistrar[0].totalCount[0]['count']
        ? facilitysRegistrar[0].totalCount[0]['count']
        : 0;

      const headers = new Array<ResponseHeaders>();

      const obj =
        facilitysRegistrar[0].paginatedResult.length > 0
          ? facilitysRegistrar[0].paginatedResult[0]
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
            if (key.toLowerCase().includes('date')) {
              header.type = 'date';
            } else {
              header.type = 'string';
            }
            headers.push(header);
          }
        });
      }
      response.data = facilitysRegistrar[0].paginatedResult;
      response.headers = headers;
      response.page = page;
      response.limit = limit;
      response.pages = Math.ceil(total / limit);
      response.total = total;
      return response;
    }
    response.data = [];
    response.headers = [];
    response.page = 0;
    response.limit = 0;
    response.pages = 0;
    response.total = 0;
    return response;
  }

  async getFacilityRegistrarById(id: ObjectId): Promise<IFacilityRegistrar> {
    const facilityRegistrar =
      await this.facilityRegistrarDAL.getFacilityRegistrarById(id);
    if (!facilityRegistrar)
      throw new BadRequestException('Facility Registrar does not exist!');
    return facilityRegistrar;
  }

  async getFacilityRegistrarByFacilityId(
    facilityId: number,
  ): Promise<IFacilityRegistrar[]> {
    return this.facilityRegistrarDAL.getFacilityRegistrarByFacilityId(
      facilityId,
    );
  }

  async updateFacilityRegistrar(
    id: ObjectId,
    facilityRegistrar: FacilityRegistrarDTO,
  ): Promise<IFacilityRegistrar> {
    return await this.facilityRegistrarDAL.updateFacilityRegistrar(
      id,
      facilityRegistrar,
    );
  }

  async deleteFacilityRegistrar(id: ObjectId) {
    await this.facilityRegistrarDAL.deleteFacilityRegistrar(id);
  }

  facilityRegistrarKeys = [
    'PlacementId',
    'FacilityId',
    'FirstName',
    'LastName',
    'StartDate',
    'EndDate',
  ];

  async readAndStoreFacilityRegistrar(buffer: Buffer) {
    let output = await this.csvParser.extractDataFromCSV(
      buffer,
      this.facilityRegistrarKeys,
    );
    const validationObject = {
      ErrorData: [],
      processed: 0,
      ErrorDataCount: 0,
    };
    output = JSON.parse(JSON.stringify(output));
    for (let index = 0; index < output.length; index++) {
      const element = output[index];
      if (element.StartDate.trim() === '' && element.EndDate.trim() === '') {
        continue;
      }
      const startDateObject = moment(element.StartDate, 'D/MM/YYYY');
      const startDate = startDateObject.toDate();
      const endDateObject = moment(element.EndDate, 'DD/MM/YYYY');
      const endDate = endDateObject.toDate();
      const newFacilityRegistrar = new FacilityRegistrarDTO();
      Object.keys(element).forEach((obj) => {
        if (obj.trim() === 'FacilityId') {
          newFacilityRegistrar.facilityId = parseInt(element[obj]);
        } else if (obj.trim() === 'PlacementId') {
          newFacilityRegistrar.placementId = parseInt(element[obj].trim());
        } else if (obj.trim() === 'FirstName') {
          newFacilityRegistrar.firstName = element[obj].trim();
        } else if (obj.trim() === 'LastName') {
          newFacilityRegistrar.lastName = element[obj].trim();
        } else if (obj.trim() === 'StartDate') {
          newFacilityRegistrar.startDate = startDate;
        } else if (obj.trim() === 'EndDate') {
          newFacilityRegistrar.endDate = endDate;
        }
      });
      const responseData = validateData(newFacilityRegistrar);
      if (responseData.isValid === true) {
        await this.facilityRegistrarDAL.findAndUpdateByFacilityRegistrarId(
          newFacilityRegistrar.placementId,
          newFacilityRegistrar,
        );
        validationObject.processed++;
      } else {
        validationObject.ErrorData.push(
          `Facility Id : ${newFacilityRegistrar.facilityId} its ${
            responseData?.key ?? ''
          } data is not proper, its data is ${
            responseData?.value ?? ''
          }, due to that it is not processed.`,
        );
        validationObject.ErrorDataCount++;
      }
    }
    return validationObject;
  }
}
