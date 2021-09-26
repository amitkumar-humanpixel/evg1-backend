import { BadRequestException, Injectable } from '@nestjs/common';
import { ResponseHeaders } from 'src/Common/common.dto';
import { AccreditionService } from 'src/Accredition/accredition.service';
import { UserService } from 'src/User/user.service';
import { DashboardResult, GetDashboardDTOResponse } from './dashboard.dto';

@Injectable()
export class DashboardService {
  constructor(
    private readonly accreditionService: AccreditionService,
    private readonly userService: UserService,
  ) { }

  async getDashboardStatusDetails(userId: number) {
    const user = await this.userService.getUserByUserId(userId);
    if (user != null) {
      let data;
      if (user.role.toLowerCase() === 'supervisor') {
        data =
          await this.accreditionService.getSupervisorDashboardStatusDetails(
            userId,
          );
      } else if (
        user.role.toLowerCase() === 'practice_manager' ||
        user.role.toLowerCase() === 'principal_supervisor'
      ) {
        data =
          await this.accreditionService.getPracticeManagerDataDashboardStatusDetails(
            userId,
          );
      } else if (user.role.toLowerCase() === 'accreditor') {
        data =
          await this.accreditionService.getAccreditorDashboardStatusDetails(
            userId,
          );
      } else {
        data = await this.accreditionService.getDashboardStatusDetails();
      }
      return data;
    } else {
      throw new BadRequestException('Invalid UserId!');
    }
  }

  async getDashboardData(
    userId: number,
    page: number,
    limit: number,
    status: string,
  ): Promise<any> {
    const user = await this.userService.getUserByUserId(userId);
    if (user != null) {
      if (
        user.role.toLowerCase().includes('admin') ||
        user.role.toLowerCase() === 'accreditation_support_coordinator'
      ) {
        userId = 0;
      }
      let data;
      let currentStatus = '';
      if (user.role.toLowerCase() === 'supervisor') {
        const supervisorStatus =
          status.toLowerCase() === 'incomplete' ? false : true;
        data = await this.accreditionService.getSupervisorDashboardData(
          userId,
          page,
          limit,
          supervisorStatus,
        );
        currentStatus = supervisorStatus ? 'COMPLETE' : 'INCOMPLETE';
      } else if (
        user.role.toLowerCase() === 'practice_manager' ||
        user.role.toLowerCase() === 'principal_supervisor'
      ) {
        if (status === 'COMPLETE' || status === 'INCOMPLETE') {
          data = await this.accreditionService.getPracticeManagerDetailData(
            userId,
            page,
            limit,
            status,
          );
        } else {
          data =
            await this.accreditionService.getPracticeManagerAndAccreditorDashboardData(
              userId,
              page,
              limit,
              status,
            );
        }
      } else if (user.role.toLowerCase() === 'accreditor') {
        data =
          await this.accreditionService.getPracticeManagerAndAccreditorDashboardData(
            userId,
            page,
            limit,
            status,
          );
      } else {
        data = await this.accreditionService.getDashboardData(
          page,
          limit,
          status,
        );
      }
      const response = new GetDashboardDTOResponse();
      let total = 0;
      if (data[0].totalCount.length > 0) {
        total = data[0].totalCount[0]['count']
          ? data[0].totalCount[0]['count']
          : 0;
      }

      const headers = new Array<ResponseHeaders>();
      const arrDashboarData = [];
      data[0].paginatedResult.map((obj) => {
        const dashboardData = new DashboardResult();
        dashboardData.accreditionId = obj._id;
        dashboardData.facilityId = obj.facilityId;
        dashboardData.createdAt = obj.createdAt;
        dashboardData.status =
          currentStatus === 'INCOMPLETE'
            ? currentStatus
            : currentStatus === 'COMPLETE'
              ? currentStatus
              : obj.status;
        dashboardData.practiceName = obj.facility.practiceName;
        if (
          user.role.toLowerCase().includes('super_admin') ||
          user.role.toLowerCase().includes('practice_manager') ||
          user.role.toLowerCase().includes('principal_supervisor') ||
          user.role
            .toLowerCase()
            .includes('accreditation_support_coordinator') ||
          user.role.toLowerCase().includes('accreditor')
        ) {
          let isCheck = false;
          console.log(obj.isReaccreditationChecklistComplete);
          if (!obj.isReaccreditationChecklistComplete) {
            console.log('140');
            dashboardData.formType = 'reaccreditationChecklist';
            isCheck = true;
          } else if (!obj.isPostDetailsComplete) {
            console.log('143');
            dashboardData.formType = 'postDetails';
            isCheck = true;
          }
          if (!isCheck) {
            for (let index = 0; index < obj.formA.length; index++) {
              const element = obj.formA[index];
              if (!element.isComplete) {
                dashboardData.formType = 'formA';
                isCheck = true;
                break;
              }
            }
          }

          if (!isCheck) {
            for (let index = 0; index < obj.formA1.length; index++) {
              const element = obj.formA1[index];
              if (!element.isComplete) {
                dashboardData.formType = 'formA1';
                isCheck = true;
                break;
              }
            }
          }

          if (!isCheck) {
            console.log(obj.isAddressRecommendation);
            if (!obj.isAddressRecommendation) {
              dashboardData.formType = 'previousRecommendations';
              isCheck = true;
            }
          }

          if (!isCheck) {
            for (let index = 0; index < obj.formB.length; index++) {
              const element = obj.formB[index];
              if (!element.isComplete) {
                dashboardData.formType = 'formB';
                break;
              } else if (index == obj.formB.length - 1) {
                dashboardData.formType = 'formB';
                break;
              }
            }
          }
        } else if (user.role.toLowerCase().includes('supervisor')) {
          for (let index = 0; index < obj.formA1.length; index++) {
            const element = obj.formA1[index];
            if (!element.isComplete || element.isComplete) {
              dashboardData.formType = 'formA1';
              break;
            } else if (index == obj.formB.length - 1) {
              dashboardData.formType = 'formA1';
              break;
            }
          }
        }
        arrDashboarData.push(dashboardData);
      });
      const obj = arrDashboarData.length > 0 ? arrDashboarData[0] : null;

      if (obj !== null) {
        const headerKeys = Object.keys(obj);

        headerKeys.map((key) => {
          if (key != 'accreditionId') {
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
            if (key.toLowerCase().includes('createdat')) {
              header.type = 'date';
            } else {
              header.type = 'string';
            }

            headers.push(header);
          }
        });
      }
      response.data = arrDashboarData;
      response.headers = headers;
      response.page = page;
      response.limit = limit;
      response.pages = Math.ceil(total / limit);
      response.total = total;
      return response;
    } else {
      throw new BadRequestException('Invalid UserId!');
    }
  }
}
