import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { ObjectId } from 'mongoose';
import { IFacility } from 'src/Facility/facility.interface';
import { SupervisorDetailsDTO } from 'src/FormA/formA.dto';
import { FormAService } from 'src/FormA/formA.service';
import { UserService } from 'src/User/user.service';
import { AccreditionDAL } from './accredition.dal';
import {
  AccreditionDetails,
  AccreditionDTO,
  AccreditionSideBarDTO,
  CreateAccreditionDTO,
  formClass,
  PostDetailAddDTO,
  PostDetailsDTO,
  practiceManagerDataDTO,
  ReaccreditationChecklistDTO,
  ReaccreditionCheckListDTO,
  SideBarDataDTO,
  supervisorDataDTO,
} from './accredition.dto';
import { IAccredition } from './accredition.interface';

@Injectable()
export class AccreditionService {
  constructor(
    private readonly accreditionDAL: AccreditionDAL,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    @Inject(forwardRef(() => FormAService))
    private readonly formAService: FormAService,
  ) { }

  async updateAccredition(postDetail: PostDetailAddDTO): Promise<ObjectId> {
    return await this.accreditionDAL.updateAccredition(postDetail);
  }

  async updateAccreditionChecklist(
    details: ReaccreditationChecklistDTO,
  ): Promise<ObjectId> {
    details.status = 'PENDING';
    const accreditionId = await this.accreditionDAL.updateAccreditionChecklist(
      details,
    );
    await this.formAService.addNewFormA(accreditionId);
    return accreditionId;
  }

  async updateAccreditionDetails(
    postDetail: PostDetailAddDTO,
  ): Promise<ObjectId> {
    return await this.accreditionDAL.updateAccredition(postDetail);
  }

  async getAccreditionById(accreditionId: ObjectId): Promise<PostDetailsDTO> {
    const response = await this.accreditionDAL.getAccreditionByIdForPostDetails(
      accreditionId,
    );
    return response[0];
  }

  async getReaccreditionCheckList(
    accreditionId: ObjectId,
  ): Promise<ReaccreditionCheckListDTO> {
    const response =
      await this.accreditionDAL.getAccreditionByIdReaccreditionCheckList(
        accreditionId,
      );
    return response[0];
  }

  async getAccreditionByAccreditionId(accreditionId: ObjectId) {
    return await this.accreditionDAL.getAccreditionById(accreditionId);
  }

  async deleteFormA1RelatedDetails(accreditionId: ObjectId, userId: number) {
    const accredition = await this.accreditionDAL.getAccreditionById(
      accreditionId,
    );

    accredition.formA1 = accredition.formA1.filter(
      (x) => x.userId !== userId.toString(),
    );

    await this.accreditionDAL.updateAccreditionById(
      accredition._id,
      accredition,
    );
  }

  async createAccreditionByFacility(
    facility: IFacility,
    practiceManagerIds: number[],
  ): Promise<any> {
    const users = await this.userService.getSuperAdmins();
    const ascUsers = await this.userService.getASCUsers();
    const objAccredition = new CreateAccreditionDTO();
    objAccredition.facilityId = facility.facilityId;
    objAccredition.address = facility.address;
    objAccredition.status = 'INCOMPLETE';

    objAccredition.users = new Array<number>();
    for (let index = 0; index < users.length; index++) {
      const element = users[index];
      objAccredition.users.push(element.userId);
    }

    if (ascUsers !== null) {
      for (let index = 0; index < ascUsers.length; index++) {
        const element = ascUsers[index];
        objAccredition.users.push(element.userId);
      }
    }

    objAccredition.users.push(facility.userId);
    for (let index = 0; index < practiceManagerIds.length; index++) {
      const element = practiceManagerIds[index];
      objAccredition.users.push(element);
    }
    // if (practiceManagerId != null) {
    //   objAccredition.users.push(practiceManagerId);
    // }
    objAccredition.formA = new Array<formClass>();
    objAccredition.formA.push(new formClass('Practice Manager', false));
    objAccredition.formA.push(new formClass('Standards', false));
    objAccredition.formA.push(new formClass('Supervisor', false));
    objAccredition.formA.push(new formClass('Registrar', false));
    objAccredition.formA1 = new Array<formClass>();
    objAccredition.formB = new Array<formClass>();
    objAccredition.formB.push(new formClass('Assign Accreditor', false));
    objAccredition.formB.push(new formClass('Summary', false));
    objAccredition.formB.push(new formClass('Declaration', false));

    return await this.accreditionDAL.createAccredition(objAccredition);
  }

  async getAccreditionSideBar(
    id: ObjectId,
    userId: number,
  ): Promise<AccreditionDTO> {
    const user = await this.userService.getUserByUserId(userId);
    const accredition = await this.accreditionDAL.getAccreditionDetailsById(id);
    console.log(accredition.isAddressRecommendation);
    if (user === null) {
      throw new BadRequestException('User does not exist!');
    }
    if (accredition !== undefined && accredition !== null) {
      const isEditable =
        user.role.toLowerCase() === 'accreditor' ? false : true;
      const resAccredition = new AccreditionDTO();
      resAccredition.accreditionId = accredition?._id ?? undefined;
      resAccredition.facilityId = accredition?.facilityId ?? undefined;
      resAccredition.accreditionName =
        accredition?.facility?.practiceName ?? '';
      const arrSideBar = new Array<AccreditionSideBarDTO>();

      let obj = new AccreditionSideBarDTO();

      if (user.role.toLowerCase() !== 'supervisor') {
        obj.addDetails(
          'Reaccreditation Checklist',
          accredition.isReaccreditationChecklistComplete,
        );
        obj.isEditable = isEditable
          ? user.role.toLowerCase() === 'super_admin' ||
            user.role.toLowerCase() === 'accreditation_support_coordinator' ||
            user.role.toLowerCase() === 'practice_manager' ||
            user.role.toLowerCase() === 'principal_supervisor'
            ? accredition.isFormA1Complete
              ? accredition.isFormBComplete
                ? false
                : false
              : true
            : isEditable
          : isEditable;
        arrSideBar.push(obj);
        obj = new AccreditionSideBarDTO();
        obj.addDetails('Post Details', accredition.isPostDetailsComplete);
        obj.isEditable = isEditable
          ? user.role.toLowerCase() === 'super_admin' ||
            user.role.toLowerCase() === 'accreditation_support_coordinator' ||
            user.role.toLowerCase() === 'practice_manager' ||
            user.role.toLowerCase() === 'principal_supervisor'
            ? accredition.isFormA1Complete
              ? false
              : true
            : isEditable
          : isEditable;
        arrSideBar.push(obj);

        for (let i = 0; i < accredition.formA.length; i++) {
          if (i == 0) {
            obj = new AccreditionSideBarDTO();
            if (accredition.formA.some((x) => x.isComplete == false)) {
              obj.addDetails('Form A', false, "Clinical Section");
              obj.isEditable = isEditable
                ? user.role.toLowerCase() === 'super_admin' ||
                  user.role.toLowerCase() ===
                  'accreditation_support_coordinator' ||
                  user.role.toLowerCase() === 'practice_manager' ||
                  user.role.toLowerCase() === 'principal_supervisor'
                  ? accredition.isFormA1Complete && accredition.isFormAComplete
                    ? false
                    : true
                  : isEditable
                : isEditable;
            } else {
              obj.addDetails('Form A', true, "Clinical Section");
              obj.isEditable = isEditable
                ? user.role.toLowerCase() === 'super_admin' ||
                  user.role.toLowerCase() ===
                  'accreditation_support_coordinator' ||
                  user.role.toLowerCase() === 'practice_manager' ||
                  user.role.toLowerCase() === 'principal_supervisor'
                  ? accredition.isFormA1Complete && accredition.isFormAComplete
                    ? false
                    : true
                  : isEditable
                : isEditable;
            }
          }

          const element = accredition.formA[i];

          const form = new SideBarDataDTO(
            element.stepName,
            element.isComplete,
            isEditable
              ? user.role.toLowerCase() === 'super_admin' ||
                user.role.toLowerCase() ===
                'accreditation_support_coordinator' ||
                user.role.toLowerCase() === 'practice_manager' ||
                user.role.toLowerCase() === 'principal_supervisor'
                ? accredition.isFormA1Complete && accredition.isFormAComplete
                  ? false
                  : true
                : isEditable
              : isEditable,
          );
          obj.addSubSteps(form);
        }
        arrSideBar.push(obj);
      }
      const isSupervisor = user.role.toLowerCase() === 'supervisor';
      const isAdd = accredition.formA1.filter(
        (x) => parseInt(x.userId) === user.userId && isSupervisor,
      );
      if (isAdd.length > 0) {
        const form = new SideBarDataDTO(
          isAdd[0].stepName,
          isAdd[0].isComplete,
          true,
          isAdd[0].userId,
        );
        obj = new AccreditionSideBarDTO();
        obj.addDetails('Form A1', isAdd[0]?.isComplete ?? false, "Supervisor Section");
        obj.isEditable = isEditable
          ? accredition.isFormA1Complete
            ? false
            : isEditable
          : isEditable;
        obj.addSubSteps(form);
        arrSideBar.push(obj);
      } else if (
        user.role.toLowerCase().includes('super_admin') ||
        user.role.toLowerCase().includes('accreditation_support_coordinator') ||
        user.role.toLowerCase().includes('practice_manager') ||
        user.role.toLowerCase().includes('principal_supervisor') ||
        user.role.toLowerCase() === 'accreditor'
      ) {
        for (let i = 0; i < accredition.formA1.length; i++) {
          if (i == 0) {
            obj = new AccreditionSideBarDTO();
            if (accredition.formA1.some((x) => x.isComplete === false)) {
              obj.addDetails('Form A1', false);
              obj.isEditable =
                accredition.formA1[i].userId === user.userId ? true : false;
            } else {
              obj.addDetails('Form A1', true);
              obj.isEditable =
                accredition.formA1[i].userId === user.userId ? true : false;
            }
          }
          console.log(obj);
          const element = accredition.formA1[i];
          if (!element.stepName.toLowerCase().includes('final')) {
            console.log(accredition.formA1[i].userId);
            console.log(user.userId);
            const form = new SideBarDataDTO(
              element.stepName,
              element.isComplete,
              accredition.formA1[i].userId == user.userId ? true : false,
              element.userId,
            );
            obj.addSubSteps(form);
          }
        }
        if (accredition.formA1.length === 0) {
          obj = new AccreditionSideBarDTO();
          obj.addDetails('Form A1', false, "Supervisor Section");
        }

        arrSideBar.push(obj);
        obj = new AccreditionSideBarDTO();
        obj.addDetails(
          'Previous Recommendations',
          accredition.isAddressRecommendation,
        );
        obj.isEditable = isEditable
          ? user.role.toLowerCase() === 'super_admin' ||
            user.role.toLowerCase() === 'accreditation_support_coordinator'
            ? accredition.isAddressRecommendation
              ? !accredition.isFormBComplete
                ? true
                : false
              : true
            : user.role.toLowerCase() === 'practice_manager' ||
              user.role.toLowerCase() === 'principal_supervisor'
              ? accredition.isFormA1Complete && accredition.isFormAComplete
                ? !accredition.isAddressRecommendation
                  ? true
                  : false
                : true
              : isEditable
          : isEditable;
        arrSideBar.push(obj);
      }

      if (
        user.role.toLowerCase().includes('accreditor') ||
        user.role.toLowerCase().includes('accreditation_support_coordinator') ||
        user.role.toLowerCase().includes('super_admin')
      ) {
        for (let i = 0; i < accredition.formB.length; i++) {
          if (i == 0) {
            obj = new AccreditionSideBarDTO();
            if (accredition.formB.some((x) => x.isComplete === false)) {
              obj.addDetails('Form B', false, "Accreditor Section");
            } else {
              obj.addDetails('Form B', true, "Accreditor Section");
            }
          }

          const element = accredition.formB[i];
          if (
            user.role.toLowerCase().includes('accreditor') &&
            element.stepName === 'Assign Accreditor'
          ) {
            continue;
          }
          const form = new SideBarDataDTO(
            element.stepName,
            element.isComplete,
            accredition.isFormBComplete ? false : true,
          );
          obj.addSubSteps(form);
        }
        arrSideBar.push(obj);
      }

      resAccredition.accreditionSideBar = arrSideBar;
      return resAccredition;
    } else {
      throw new BadRequestException('Facility does not exist!');
    }
  }

  async getAccreditionDetailByUserId(
    userId: number,
  ): Promise<AccreditionDetails> {
    // if (
    //   user.role.toLowerCase().includes('accreditation_support_coordinator') ||
    //   user.role.toLowerCase().includes('accreditor')
    // ) {
    //   data = await this.accreditionDAL.getAllAccreditions();
    // } else {
    const data = await this.accreditionDAL.getAccreditionByUserId(userId);
    //}
    if (data == null) return new AccreditionDetails();
    // const arrResponse = [];
    // for (let index = 0; index < data.length; index++) {
    //   const element = data[index];
    const response = new AccreditionDetails();
    // response.accreditionId = data._id;
    // response.facilityId = data.facilityId as number;
    response.userId = userId;
    return response;
    //   arrResponse.push(response);
    // }
    // return arrResponse;
  }

  async getAccreditionIdByUserId(userId: number): Promise<AccreditionDetails> {
    const data = await this.accreditionDAL.getAccreditionByUserId(userId);

    if (data == null) return new AccreditionDetails();

    const response = new AccreditionDetails();
    response.accreditionId = data._id;
    response.facilityId = undefined;
    response.userId = undefined;
    return response;
    //   arrResponse.push(response);
    // }
    // return arrResponse;
  }

  async getDashboardData(
    page: number,
    limit: number,
    status: string,
  ): Promise<any> {
    return await this.accreditionDAL.getDashboardData(0, page, limit, status);
  }

  async getAccreditorDashboardStatusDetails(userId: number): Promise<any> {
    return await this.accreditionDAL.getDashboardStatusData(userId);
  }

  async getDashboardStatusDetails(): Promise<any> {
    return await this.accreditionDAL.getDashboardStatusData(0);
  }

  async getSupervisorDashboardStatusDetails(userId: number): Promise<any> {
    const data = await this.accreditionDAL.getSupervisorDashboardStatusData(
      userId,
    );

    const response = [];
    let complete = 0;
    let incomplete = 0;

    for (let index = 0; index < data.length; index++) {
      const element = data[index];
      const value = element.formA1.filter((value) => value.userId === userId);
      if (value.length > 0) {
        if (value[0].isComplete) {
          complete = complete += 1;
        } else {
          incomplete = incomplete += 1;
        }
      }
    }

    if (complete !== 0) {
      response.push({
        _id: 'COMPLETE',
        count: complete,
      });
    }

    if (incomplete !== 0) {
      response.push({
        _id: 'INCOMPLETE',
        count: incomplete,
      });
    }

    return response;
  }

  async getPracticeManagerDataDashboardStatusDetails(
    userId: number,
  ): Promise<any> {
    const data =
      await this.accreditionDAL.getPracticeManagerDashboardStatusData(userId);

    const response = [];
    let complete = 0;
    let incomplete = 0;
    let pending = 0;
    let review = 0;

    for (let index = 0; index < data.length; index++) {
      const element = data[index];
      if (element.status === 'COMPLETE') {
        complete = complete += 1;
      } else if (element.status === 'PENDING') {
        pending = pending += 1;
      } else if (element.status === 'REVIEW') {
        review = review += 1;
      } else {
        if (element.isFormA1Complete === true) {
          complete = complete += 1;
        } else {
          incomplete = incomplete += 1;
        }
      }
    }
    if (complete !== 0) {
      response.push({
        _id: 'COMPLETE',
        count: complete,
      });
    }

    if (incomplete !== 0) {
      response.push({
        _id: 'INCOMPLETE',
        count: incomplete,
      });
    }

    if (pending !== 0) {
      response.push({
        _id: 'PENDING',
        count: pending,
      });
    }

    if (review !== 0) {
      response.push({
        _id: 'REVIEW',
        count: review,
      });
    }
    console.log(response);
    return response;
  }

  async getSupervisorDashboardData(
    userId: number,
    page: number,
    limit: number,
    status: boolean,
  ): Promise<any> {
    const data = await this.accreditionDAL.getSupervisorDashboardData(
      userId,
      page,
      limit,
      status,
    );
    const obj = new supervisorDataDTO();
    obj.paginatedResult = [];
    obj.totalCount = [];
    for (let index = 0; index < data.length; index++) {
      const element = data[index];
      for (let j = 0; j < element.paginatedResult.length; j++) {
        const pagedData = element.paginatedResult[j];
        const filtered = pagedData.formA1.filter(
          (x) => x.userId === userId && x.isComplete == status,
        );
        if (filtered.length > 0) {
          obj.paginatedResult.push(pagedData);
          //obj.totalCount(...element.totalCount);
        }
      }
    }
    obj.totalCount.push({ count: obj.paginatedResult.length });
    return [obj];
  }

  async getPracticeManagerDetailData(userId, page, limit, status) {
    const data = await this.accreditionDAL.getPracticeManagerDetailData(
      userId,
      page,
      limit,
    );
    const obj = new practiceManagerDataDTO();
    obj.paginatedResult = [];
    obj.totalCount = [];
    for (let index = 0; index < data.length; index++) {
      const element = data[index];
      console.log(element);
      for (let j = 0; j < element.paginatedResult.length; j++) {
        const pagedData = element.paginatedResult[j];
        if (status === 'INCOMPLETE') {
          if (
            pagedData.status === 'INCOMPLETE' &&
            pagedData.isFormA1Complete === false
          ) {
            obj.paginatedResult.push(pagedData);
          } else if (
            pagedData.status === 'INCOMPLETE' &&
            pagedData.isFormAComplete === false
          ) {
            console.log('in');
            obj.paginatedResult.push(pagedData);
          }
        } else if (status === 'COMPLETE') {
          if (
            pagedData.status === 'INCOMPLETE' &&
            pagedData.isFormA1Complete === true &&
            pagedData.isFormAComplete === true
          ) {
            pagedData.status = 'COMPLETE';
            obj.paginatedResult.push(pagedData);
          } else if (
            pagedData.status === 'COMPLETE' &&
            pagedData.isFormA1Complete === true
          ) {
            obj.paginatedResult.push(pagedData);
          }
        }
        // const filtered = pagedData.formA1.filter(
        //   (x) => x.userId === userId && x.isComplete == status,
        // );
        // if (filtered.length > 0) {
        //   obj.paginatedResult.push(pagedData);
        //   //obj.totalCount(...element.totalCount);
        // }
      }
    }
    obj.totalCount.push({ count: obj.paginatedResult.length });
    return [obj];
  }

  async getPracticeManagerAndAccreditorDashboardData(
    userId: number,
    page: number,
    limit: number,
    status: string,
  ) {
    return await this.accreditionDAL.getPracticeManagerDashboardData(
      userId,
      page,
      limit,
      status,
    );
  }

  async completeFormA(id: ObjectId) {
    const accredition = await this.accreditionDAL.getAccreditionById(id);

    accredition.isFormAComplete = true;
    await this.accreditionDAL.updateAccreditionById(
      accredition._id,
      accredition,
    );
  }

  async completeFormA1(id: ObjectId) {
    const accredition = await this.accreditionDAL.getAccreditionById(id);
    accredition.status = 'REVIEW';
    accredition.isFormAComplete = true;
    accredition.isFormA1Complete = true;
    await this.accreditionDAL.updateAccreditionById(
      accredition._id,
      accredition,
    );
  }

  async completeFormB(id: ObjectId) {
    const accredition = await this.accreditionDAL.getAccreditionById(id);

    accredition.isFormAComplete = true;
    accredition.isFormA1Complete = true;
    accredition.isFormBComplete = true;
    await this.accreditionDAL.updateAccreditionById(
      accredition._id,
      accredition,
    );
  }

  async completeFormASteps(id: ObjectId, stepName: string) {
    const accredition = await this.accreditionDAL.getAccreditionById(id);
    accredition.status = 'PENDING';
    accredition.formA.map((o) => {
      if (o.stepName === stepName) {
        o.isComplete = true;
      }
    });

    const completeAll = accredition.formA.every((x) => x.isComplete === true);

    if (completeAll && accredition.isFormA1Complete) {
      accredition.status = 'REVIEW';
    }

    await this.accreditionDAL.updateAccreditionById(
      accredition._id,
      accredition,
    );
  }

  async updateAccreditionByAccreditionId(accredition: IAccredition) {
    await this.accreditionDAL.updateAccreditionById(
      accredition._id,
      accredition,
    );
  }

  async addSupervisors(
    id: ObjectId,
    supervisorDetails: SupervisorDetailsDTO[],
  ) {
    const accredition = await this.accreditionDAL.getAccreditionById(id);
    //const count = supervisorDetails.length;

    //const lastItem = accredition.formA1[accredition.formA1.length - 1];

    accredition.formA1 = [];

    for (let index = 0; index < supervisorDetails.length; index++) {
      const element = supervisorDetails[index];
      const user = await this.userService.getUserByUserId(
        element.userId as number,
      );
      if (accredition.users != undefined) {
        const existingUser = accredition.users.find(
          (x) => x == element.userId.toString(),
        );
        if (existingUser == undefined) {
          accredition.users.unshift(element.userId.toString());
        }
      }
      accredition.formA1.unshift(
        new formClass(
          `${user.firstName} ${user.lastName}`,
          element.status,
          element.userId.toString(),
        ),
      );
    }

    //accredition.formA1.push(lastItem);

    await this.accreditionDAL.updateAccreditionById(
      accredition._id,
      accredition,
    );
  }

  async completeSupervisorDetails(id: ObjectId, userId: string) {
    const accredition = await this.accreditionDAL.getAccreditionById(id);

    accredition.formA1.map((o) => {
      if (o.userId === userId) {
        o.isComplete = true;
      }
    });

    // const isAllDone = accredition.formA1.every((o) => o.isComplete === true);

    // if (isAllDone) {
    //   accredition.status = 'INCOMPLETE';
    // }

    await this.accreditionDAL.updateAccreditionById(
      accredition._id,
      accredition,
    );
  }

  async completeFinalCheckList(id: ObjectId, stepName: string) {
    const accredition = await this.accreditionDAL.getAccreditionById(id);

    accredition.formA1.map((o) => {
      if (o.stepName === stepName) {
        o.isComplete = true;
      }
    });

    await this.accreditionDAL.updateAccreditionById(
      accredition._id,
      accredition,
    );
  }

  async completeAddressRecommendation(id: ObjectId) {
    const accredition = await this.accreditionDAL.getAccreditionById(id);

    if (accredition !== null) {
      accredition.isAddressRecommendation = true;

      await this.accreditionDAL.updateAccreditionById(
        accredition._id,
        accredition,
      );
    }
  }

  async completeFormBSteps(id: ObjectId, stepName: string) {
    const accredition = await this.accreditionDAL.getAccreditionById(id);
    if (stepName === 'Declaration') {
      accredition.status = 'COMPLETE';
    }
    accredition.formB.map((o) => {
      if (o.stepName === stepName) {
        o.isComplete = true;
      }
    });

    await this.accreditionDAL.updateAccreditionById(
      accredition._id,
      accredition,
    );
  }

  async checkUserWithUserId(userId: number) {
    return await this.accreditionDAL.checkUserWithUserId(userId);
  }

  async getAccreditationSupportCoordinatorData(accreditionId: ObjectId) {
    return await this.accreditionDAL.getAccreditationSupportCoordinatorData(
      accreditionId,
    );
  }

  async getPracticeDetailsFromAccreditionId(accreditionId: ObjectId) {
    const data = await this.accreditionDAL.getPracticeNameFromAccreditionId(
      accreditionId,
    );
    if (data.length > 0) {
      return data[0];
    } else {
      return data;
    }
  }

  async addAccredition(id: ObjectId, userId: number) {
    const accredition = await this.accreditionDAL.getAccreditionById(id);
    accredition.status = 'INCOMPLETE';
    if (!accredition.users.some((u) => u === userId.toString())) {
      accredition.users.push(userId.toString());
      await this.accreditionDAL.updateAccreditionById(
        accredition._id,
        accredition,
      );
    }
  }

  async addPracticeManager(facilityId: number, userId: number) {
    const accredition = await this.accreditionDAL.getAccreditionByFacilityId(
      facilityId,
    );
    if (accredition != null) {
      let isUpdateData = false;

      if (!accredition.users.some((u) => u === userId.toString())) {
        accredition.users.push(userId.toString());
        isUpdateData = true;
      }

      if (isUpdateData) {
        await this.accreditionDAL.updateAccreditionById(
          accredition._id,
          accredition,
        );
      }
    }
  }

  async addSuperAdminAndASC(userIds: number[]) {
    const accreditions = await this.accreditionDAL.getAllAccreditions();

    for (let index = 0; index < accreditions.length; index++) {
      const element = accreditions[index];
      for (let i = 0; i < userIds.length; i++) {
        const some = (value) => value.toString() === userIds[i].toString();
        const existingUser = element.users.some(some);
        if (existingUser === false) {
          element.users.push(userIds[i].toString());
        }
      }
      await this.accreditionDAL.updateAccreditionById(element._id, element);
    }
  }

  async getAccreditionByFacilityId(facilityId: number) {
    return await this.accreditionDAL.getAccreditionByFacilityId(facilityId);
  }
}
