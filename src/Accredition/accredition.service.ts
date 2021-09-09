import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { ObjectId } from 'mongoose';
import { FacilityDAL } from 'src/Facility/facility.dal';
import { IFacility } from 'src/Facility/facility.interface';
import { FacilityStaffService } from 'src/FacilityStaff/facilityStaff.service';
import { SupervisorDetailsDTO } from 'src/FormA/formA.dto';
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
  SideBarDataDTO,
  supervisorDataDTO,
} from './accredition.dto';

@Injectable()
export class AccreditionService {
  constructor(
    private readonly accreditionDAL: AccreditionDAL,
    private readonly facilityDAL: FacilityDAL,
    private readonly userService: UserService,
    private readonly facilityStaffService: FacilityStaffService,
  ) {}

  async updateAccredition(postDetail: PostDetailAddDTO): Promise<ObjectId> {
    postDetail.status = 'PENDING';
    return await this.accreditionDAL.updateAccredition(postDetail);
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

  async createAccredition(facilityId: number): Promise<void> {
    const users = await this.userService.getSuperAdmins();
    const accreditors =
      await this.facilityStaffService.getAccreditorByFacilityId(facilityId);
    const facility = await this.facilityDAL.getFacilityByFacilityId(facilityId);

    const objAccredition = new CreateAccreditionDTO();
    objAccredition.facilityId = facilityId;
    objAccredition.address = facility.address;
    objAccredition.status = 'INCOMPLETE';
    objAccredition.users = new Array<number>();
    for (let index = 0; index < users.length; index++) {
      const element = users[index];
      objAccredition.users.push(element.userId);
    }
    for (let index = 0; index < accreditors.length; index++) {
      const element = accreditors[index];
      objAccredition.users.push(element.userId as number);
    }
    objAccredition.users.push(facility.userId);
    objAccredition.formA = new Array<formClass>();
    objAccredition.formA.push(new formClass('Practice Manager', false));
    objAccredition.formA.push(new formClass('Standards', false));
    objAccredition.formA.push(new formClass('Supervisor', false));
    objAccredition.formA.push(new formClass('Registrar', false));
    objAccredition.formA1 = new Array<formClass>();
    objAccredition.formA1.push(new formClass('Final CheckList', false));
    objAccredition.formB = new Array<formClass>();
    objAccredition.formB.push(new formClass('Assign Accreditor', false));
    objAccredition.formB.push(new formClass('Summary', false));
    objAccredition.formB.push(new formClass('Declaration', false));

    await this.accreditionDAL.createAccredition(objAccredition);
    // need to add sending mail facility to PM
  }

  async createAccreditionByFacility(
    facility: IFacility,
    practiceManagerIds: number[],
  ): Promise<any> {
    const users = await this.userService.getSuperAdmins();
    const objAccredition = new CreateAccreditionDTO();
    objAccredition.facilityId = facility.facilityId;
    objAccredition.address = facility.address;
    objAccredition.status = 'INCOMPLETE';

    objAccredition.users = new Array<number>();
    for (let index = 0; index < users.length; index++) {
      const element = users[index];
      objAccredition.users.push(element.userId);
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
    objAccredition.formA1.push(new formClass('Final CheckList', false));
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
    if (user === null) {
      throw new BadRequestException('User does not exist!');
    }
    if (accredition !== undefined && accredition !== null) {
      const isEditable =
        user.role.toLowerCase() === 'accreditor' ? false : true;
      const resAccredition = new AccreditionDTO();
      resAccredition.accreditionId = accredition?._id ?? undefined;
      resAccredition.accreditionName =
        accredition?.facility?.practiceName ?? '';
      const arrSideBar = new Array<AccreditionSideBarDTO>();

      let obj = new AccreditionSideBarDTO();

      if (!user.role.toLowerCase().includes('supervisor')) {
        obj.addDetails('Post Details', accredition.isPostDetailsComplete);
        obj.isEditable = isEditable;
        arrSideBar.push(obj);

        for (let i = 0; i < accredition.formA.length; i++) {
          if (i == 0) {
            obj = new AccreditionSideBarDTO();
            if (accredition.formA.some((x) => x.isComplete == false)) {
              obj.addDetails('Form A', false);
              obj.isEditable = isEditable;
            } else {
              obj.addDetails('Form A', true);
              obj.isEditable = isEditable;
            }
          }

          const element = accredition.formA[i];

          const form = new SideBarDataDTO(
            element.stepName,
            element.isComplete,
            isEditable,
          );
          obj.addSubSteps(form);
        }
        arrSideBar.push(obj);
      }

      const isAdd = accredition.formA1.filter(
        (x) => parseInt(x.userId) === user.userId,
      );
      if (isAdd.length > 0) {
        const form = new SideBarDataDTO(
          isAdd[0].stepName,
          isAdd[0].isComplete,
          true,
          isAdd[0].userId,
        );
        obj = new AccreditionSideBarDTO();
        obj.addDetails('Form A1', false);
        obj.isEditable = isEditable;
        obj.addSubSteps(form);
        arrSideBar.push(obj);
      } else if (
        user.role.toLowerCase().includes('super_admin') ||
        user.role.toLowerCase().includes('accreditation_support_coordinator') ||
        user.role.toLowerCase().includes('practice_manager') ||
        user.role.toLowerCase() === 'accreditor'
      ) {
        for (let i = 0; i < accredition.formA1.length; i++) {
          if (i == 0) {
            obj = new AccreditionSideBarDTO();
            if (accredition.formA1.some((x) => x.isComplete === false)) {
              obj.addDetails('Form A1', false);
              obj.isEditable = isEditable;
            } else {
              obj.addDetails('Form A1', true);
              obj.isEditable = isEditable;
            }
          }
          const element = accredition.formA1[i];
          const form = new SideBarDataDTO(
            element.stepName,
            element.isComplete,
            element.stepName.toLowerCase().includes('final') ? true : false,
            element.userId,
          );
          obj.addSubSteps(form);
        }
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
              obj.addDetails('Form B', false);
            } else {
              obj.addDetails('Form B', true);
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
            true,
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

  // async getAccreditionSideBarOld(
  //   id: ObjectId,
  //   userId: number,
  // ): Promise<AccreditionDTO> {
  //   const user = await this.userService.getUserByUserId(userId);
  //   console.log(user);
  //   const accredition = await this.accreditionDAL.getAccreditionById(id);
  //   console.log(accredition);
  //   if (user === null) {
  //     throw new BadRequestException('User does not exist!');
  //   }
  //   if (accredition !== null) {
  //     const resAccredition = new AccreditionDTO();
  //     resAccredition.accreditionId = accredition._id;
  //     const arrSideBar = new Array<AccreditionSideBarDTO>();

  //     let obj = new AccreditionSideBarDTO();
  //     if (
  //       user.role.toLowerCase().includes('practice_manager') ||
  //       user.role.toLowerCase() === 'principal_supervisor' ||
  //       user.role.toLowerCase().includes('accreditation_support_coordinator') ||
  //       user.role.toLowerCase().includes('super_admin')
  //     ) {
  //       obj.addDetails('Post Details', accredition.isPostDetailsComplete);
  //       arrSideBar.push(obj);

  //       for (let i = 0; i < accredition.formA.length; i++) {
  //         if (i == 0) {
  //           obj = new AccreditionSideBarDTO();
  //           if (accredition.formA.some((x) => x.isComplete == false)) {
  //             obj.addDetails('Form A', false);
  //           } else {
  //             obj.addDetails('Form A', true);
  //           }
  //         }

  //         const element = accredition.formA[i];
  //         const form = new formClass(element.stepName, element.isComplete);
  //         obj.addSubSteps(form);
  //       }
  //       arrSideBar.push(obj);
  //     }
  //     console.log(user.role);
  //     if (
  //       user.role.toLowerCase().includes('practice_manager') ||
  //       user.role.toLowerCase() === 'principal_supervisor' ||
  //       user.role.toLowerCase() === 'supervisor' ||
  //       user.role.toLowerCase().includes('accreditation_support_coordinator') ||
  //       user.role.toLowerCase().includes('super_admin')
  //     ) {
  //       const isAdd = accredition.formA1.some(
  //         (x) => parseInt(x.userId) === user.userId,
  //       );
  //       if (
  //         isAdd ||
  //         user.role.toLowerCase().includes('super_admin') ||
  //         user.role
  //           .toLowerCase()
  //           .includes('accreditation_support_coordinator') ||
  //         user.role.toLowerCase().includes('practice_manager')
  //       ) {
  //         for (let i = 0; i < accredition.formA1.length; i++) {
  //           if (i == 0) {
  //             obj = new AccreditionSideBarDTO();
  //             if (accredition.formA1.some((x) => x.isComplete === false)) {
  //               obj.addDetails('Form A1', false);
  //             } else {
  //               obj.addDetails('Form A1', true);
  //             }
  //           }
  //           const element = accredition.formA1[i];
  //           const form = new formClass(
  //             element.stepName,
  //             element.isComplete,
  //             element.userId,
  //           );
  //           obj.addSubSteps(form);
  //           if (parseInt(element.userId) == user.userId) {
  //             obj = new AccreditionSideBarDTO();
  //             obj.addDetails('Form A1', false);
  //             obj.addSubSteps(form);
  //             break;
  //           }
  //         }
  //         arrSideBar.push(obj);
  //       }
  //     }

  //     if (
  //       user.role.toLowerCase().includes('accreditor') ||
  //       user.role.toLowerCase().includes('accreditation_support_coordinator') ||
  //       user.role.toLowerCase().includes('super_admin')
  //     ) {
  //       for (let i = 0; i < accredition.formB.length; i++) {
  //         if (i == 0) {
  //           obj = new AccreditionSideBarDTO();
  //           if (accredition.formB.some((x) => x.isComplete === false)) {
  //             obj.addDetails('Form B', false);
  //           } else {
  //             obj.addDetails('Form B', true);
  //           }
  //         }

  //         const element = accredition.formB[i];
  //         if (
  //           !user.role
  //             .toLowerCase()
  //             .includes('accreditation_support_coordinator') &&
  //           !user.role.toLowerCase().includes('super_admin') &&
  //           element.stepName === 'Assign Accreditor'
  //         ) {
  //           continue;
  //         }
  //         const form = new formClass(element.stepName, element.isComplete);
  //         obj.addSubSteps(form);
  //       }
  //       arrSideBar.push(obj);
  //     }

  //     resAccredition.accreditionSideBar = arrSideBar;
  //     return resAccredition;
  //   } else {
  //     throw new BadRequestException('Facility does not exist!');
  //   }
  // }

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
    response.accreditionId = data._id;
    response.facilityId = data.facilityId as number;
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
    userId: number,
    page: number,
    limit: number,
    status: string,
  ): Promise<any> {
    return await this.accreditionDAL.getDashboardData(
      userId,
      page,
      limit,
      status,
    );
  }

  async getPracticeManagerDashboardStatusDetails(userId: number): Promise<any> {
    return await this.accreditionDAL.getPracticeManagerDashboardStatusData(
      userId,
    );
  }

  async getDashboardStatusDetails(userId: number): Promise<any> {
    return await this.accreditionDAL.getDashboardStatusData(userId);
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
        const data = element.paginatedResult[j];
        const filtered = data.formA1.filter(
          (x) => x.userId === userId && x.isComplete == status,
        );
        if (filtered.length > 0) {
          obj.paginatedResult.push(data);
          //obj.totalCount(...element.totalCount);
        } else {
          return [obj];
        }
      }
    }
    return [obj];
  }

  async getPracticeManagerDashboardData(
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
    accredition.isFormA1Complete = true;
    await this.accreditionDAL.updateAccreditionById(
      accredition._id,
      accredition,
    );
  }

  async completeFormB(id: ObjectId) {
    const accredition = await this.accreditionDAL.getAccreditionById(id);

    accredition.isFormBComplete = true;
    await this.accreditionDAL.updateAccreditionById(
      accredition._id,
      accredition,
    );
  }

  async completeFormASteps(id: ObjectId, stepName: string) {
    const accredition = await this.accreditionDAL.getAccreditionById(id);

    accredition.formA.map((o) => {
      if (o.stepName === stepName) {
        o.isComplete = true;
      }
    });

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
    const count = supervisorDetails.length;

    const lastItem = accredition.formA1[accredition.formA1.length - 1];

    accredition.formA1 = [];

    for (let index = 0; index < supervisorDetails.length; index++) {
      const element = supervisorDetails[index];
      const user = await this.userService.getUserByUserId(
        element.userId as number,
      );
      if (accredition.users != undefined) {
        accredition.users.unshift(element.userId.toString());
      }
      accredition.formA1.unshift(
        new formClass(
          `${user.firstName} ${user.lastName}`,
          false,
          element.userId.toString(),
        ),
      );
    }

    accredition.formA1.push(lastItem);

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

    const isAllDone = accredition.formA1.every((o) => o.isComplete === true);

    if (isAllDone) {
      accredition.status = 'INCOMPLETE';
    }

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

  async getAccreditionByFacilityId(facilityId: number) {
    return await this.accreditionDAL.getAccreditionByFacilityId(facilityId);
  }
}
