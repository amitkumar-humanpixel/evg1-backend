import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import {
  FacilityDTO,
  GetFacilityDTOResponse,
  IGetFacilityDTO,
} from './facility.dto';
import { IFacility } from './facility.interface';
import { FacilityDAL } from './facility.dal';
import { FilterQuery, ObjectId } from 'mongoose';
import * as moment from 'moment-timezone';
import { ResponseHeaders } from 'src/Common/common.dto';
import { CSVParser } from 'src/Helper/csv.helper';
import { validateData, validateFacilities } from '../Helper/validation.helper';
import { AccreditionService } from 'src/Accredition/accredition.service';
import { FacilityStaffService } from 'src/FacilityStaff/facilityStaff.service';
import { mailSender } from 'src/Listeners/mail.listener';
import { UserService } from 'src/User/user.service';

@Injectable()
export class FacilityService {
  constructor(
    private facilityDAL: FacilityDAL,
    private csvParser: CSVParser,
    @Inject(forwardRef(() => AccreditionService))
    private accreditionService: AccreditionService,
    @Inject(forwardRef(() => FacilityStaffService))
    private readonly facilityStaffService: FacilityStaffService,
    private readonly userService: UserService,
  ) { }

  async insertFacility(facility: FacilityDTO): Promise<IFacility> {
    return await this.facilityDAL.addFacility(facility);
  }

  async getAllFacility(
    page: number,
    limit: number,
  ): Promise<GetFacilityDTOResponse> {
    const facilitys: IGetFacilityDTO = await this.facilityDAL.getAllFacility(
      page,
      limit,
    );
    const response = new GetFacilityDTOResponse();
    if (facilitys[0].totalCount.length > 0) {
      const total = facilitys[0].totalCount[0]['count']
        ? facilitys[0].totalCount[0]['count']
        : 0 ?? 0;

      const headers = new Array<ResponseHeaders>();

      const obj =
        facilitys[0].paginatedResult.length > 0
          ? facilitys[0].paginatedResult[0]
          : null;

      if (obj !== null) {
        const headerKeys = Object.keys(obj);

        headerKeys.map((key) => {
          if (key != '_id' && key != 'isMailSent') {
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
      response.data = facilitys[0].paginatedResult;
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

  async getFacilityById(id: number): Promise<IFacility> {
    const facility = await this.facilityDAL.getFacilityByFacilityId(id);
    if (!facility) throw new BadRequestException('Facility does not exist!');
    return facility;
  }

  async getFacilityDetailsById(id: number): Promise<IFacility> {
    const facility = await this.facilityDAL.getFacilityByFacilityId(id);
    if (!facility) throw new BadRequestException('Facility does not exist!');
    return facility;
  }

  async convertFacilityToAccredition(): Promise<void> {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    const facilitys = await this.facilityDAL.getFacilitysForAccredition(date);
    for (let index = 0; index < facilitys.length; index++) {
      const element = facilitys[index];
      const accredition =
        await this.accreditionService.getAccreditionByFacilityId(
          element.facilityId as number,
        );
      if (accredition == null) {
        const practiceManager =
          await this.facilityStaffService.getFacilityStaffByFacilityId(
            element.facilityId,
          );
        const userIds = [];
        for (let index = 0; index < practiceManager.length; index++) {
          const element = practiceManager[index];
          userIds.push(element.userId);
        }
        const accredition: any =
          await this.accreditionService.createAccreditionByFacility(
            element,
            userIds,
          );
        // use practice manager for sending mail.
        for (let index = 0; index < practiceManager.length; index++) {
          const objPracticeManager = practiceManager[index];
          const practiceManagerData: any =
            await this.userService.getUserAndFacilityDetails(
              objPracticeManager.userId,
            );
          const link =
            process.env.BASE_URL +
            process.env.FORM_READY +
            '?id=' +
            accredition._id;
          for (let j = 0; j < practiceManagerData.length; j++) {
            mailSender(
              practiceManagerData[j].email,
              practiceManagerData[j].firstName,
              practiceManagerData[j].lastName,
              element.practiceName,
              'Form Ready',
              link,
            );
          }
        }
        if (practiceManager.length > 0) {
          await this.facilityDAL.updateFacilityStatus(date);
        }
      }
    }
  }

  async convertFacilityToAccreditionFromFacilityIds(
    facilityId: Set<number>,
  ): Promise<void> {
    const facilityIds = Array.from(facilityId);
    const facilitys = await this.facilityDAL.getFacilitysForFacilityIds(
      facilityIds,
    );
    for (let index = 0; index < facilitys.length; index++) {
      const element = facilitys[index];
      const accredition =
        await this.accreditionService.getAccreditionByFacilityId(
          element.facilityId as number,
        );
      if (accredition != null) {
        const practiceManager =
          await this.facilityStaffService.getFacilityStaffByFacilityId(
            element.facilityId,
          );
        for (let index = 0; index < practiceManager.length; index++) {
          const practicemanager = practiceManager[index];
          const practiceManagerData: any =
            await this.userService.getUserAndFacilityDetails(
              practicemanager.userId,
            );
          const link =
            process.env.BASE_URL +
            process.env.FORM_READY +
            '?id=' +
            accredition._id;
          for (let j = 0; j < practiceManagerData.length; j++) {
            mailSender(
              practiceManagerData[j].email,
              practiceManagerData[j].firstName,
              practiceManagerData[j].lastName,
              element.practiceName,
              'Form Ready',
              link,
            );
          }
        }
        if (practiceManager.length > 0) {
          element.isMailSent = true;
          await this.facilityDAL.updateFacilityByFacilityDetails(element);
        }
      }
    }
  }

  async getFacilityBySkipLimit(
    filter: FilterQuery<any>,
    skip: number,
    limit: number,
  ) {
    return await this.facilityDAL.getByFacilityFilterSkipLimit(
      filter,
      skip,
      limit,
    );
  }

  async updateFacility(
    id: ObjectId,
    facility: FacilityDTO,
  ): Promise<IFacility> {
    return await this.facilityDAL.updateFacility(id, facility);
  }

  async deleteFacility(id: ObjectId) {
    await this.facilityDAL.deleteFacility(id);
  }

  facilityKeys = [
    'FacilityId',
    'PracticeName',
    'Address',
    'Suburb',
    'Postcode',
    'Email',
    'StartDate',
    'DueDate',
  ];

  async readAndStoreFacility(buffer: Buffer, userId: number) {
    let output = await this.csvParser.extractDataFromCSV(
      buffer,
      this.facilityKeys,
    );
    const validationObject = {
      ErrorData: [],
      processed: 0,
      ErrorDataCount: 0,
    };
    output = JSON.parse(JSON.stringify(output));
    // console.log('output', output);
    // console.log(output.length);
    for (let index = 0; index < output.length; index++) {
      const element = output[index];
      if (element.StartDate.trim() === '' && element.DueDate.trim() === '') {
        continue;
      }
      const startDateObject = moment(element.StartDate, 'DD/MM/YYYY');
      const startDate = startDateObject.toDate();
      const dueDateObject = moment(element.DueDate, 'DD/MM/YYYY');
      const dueDate = dueDateObject.toDate();

      const newFacility = new FacilityDTO();
      Object.keys(element).forEach((obj) => {
        if (obj.trim() === 'FacilityId') {
          newFacility.facilityId = parseInt(element[obj]);
        } else if (obj.trim() === 'PracticeName') {
          newFacility.practiceName = element[obj].trim();
        } else if (obj.trim() === 'Address') {
          newFacility.address = element[obj].trim();
        } else if (obj.trim() === 'Suburb') {
          newFacility.suburb = element[obj].trim();
        } else if (obj.trim() === 'Postcode') {
          newFacility.postalCode = element[obj].trim();
        } else if (obj.trim() === 'Email') {
          newFacility.email = element[obj].trim();
        } else if (obj.trim() === 'StartDate') {
          newFacility.startDate = startDate;
        } else if (obj.trim() === 'DueDate') {
          newFacility.dueDate = dueDate;
        }
      });

      newFacility.userId = userId;
      const responseData = validateFacilities(newFacility);
      if (responseData.isValid === true) {
        await this.facilityDAL.findAndUpdateByFacilityId(
          newFacility.facilityId,
          newFacility,
        );
        validationObject.processed++;
      } else {
        validationObject.ErrorData.push(
          `Facility Id : ${newFacility.facilityId} its ${responseData?.key ?? ''
          } data is not proper, its data is ${responseData?.value ?? ''
          }, due to that it is not processed.`,
        );
        validationObject.ErrorDataCount++;
      }
    }
    return validationObject;
  }
}
